import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatPanel from './components/ChatPanel.jsx';
import PersonaCard from './components/PersonaCard.jsx';
import PersonaSelector from './components/PersonaSelector.jsx';
import InterestIndicator from './components/InterestIndicator.jsx';
import EvalPanel from './components/EvalPanel.jsx';
import InputArea from './components/InputArea.jsx';
import { streamChat, fetchEvaluation, fetchPersonas, fetchPersonaMarkdown } from './api/claude.js';
import { fileToBase64, isValidAttachment } from './utils/fileUtils.js';

// ---------------------------------------------------------------------------
// JSON parsing helpers
// ---------------------------------------------------------------------------

function stripCodeFences(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function normalizeInteresse(val = '') {
  const up = val.toUpperCase().trim();
  if (up === 'MEDIO') return 'MÉDIO';
  if (up === 'ALTO' || up === 'MÉDIO' || up === 'BAIXO') return up;
  return 'MÉDIO';
}

function extractProgressiveFala(raw) {
  const match = raw.match(/"fala"\s*:\s*"([\s\S]*)/);
  if (!match) return null;
  let content = match[1];
  const endMatch = content.match(/^([\s\S]*?)"\s*,?\s*"interesse"/);
  if (endMatch) {
    return endMatch[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  return content.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\$/, '');
}

function parseModelResponse(raw) {
  const cleaned = stripCodeFences(raw);
  try {
    const parsed = JSON.parse(cleaned);
    return { fala: parsed.fala || cleaned, interesse: normalizeInteresse(parsed.interesse) };
  } catch {
    const falaMatch = cleaned.match(/"fala"\s*:\s*"([\s\S]*?)"\s*,?\s*(?:"interesse"|$)/);
    const interesseMatch = cleaned.match(/"interesse"\s*:\s*"([^"]+)"/i);
    const fala = falaMatch
      ? falaMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      : cleaned;
    return { fala, interesse: normalizeInteresse(interesseMatch?.[1]) };
  }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [personas, setPersonas] = useState([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState('renato');
  const [personaMd, setPersonaMd] = useState('');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  // Attached file: { file: File, base64: string, name: string, type: string } | null
  const [attachedFile, setAttachedFile] = useState(null);
  // Drag-and-drop
  const [dragOver, setDragOver] = useState(false);

  // Interest level tracking
  const [interestLevel, setInterestLevel] = useState('MÉDIO');
  const [forcedInterest, setForcedInterest] = useState(null);
  const [isManualInterest, setIsManualInterest] = useState(false);

  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ input: 0, output: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState('');

  const inputRef = useRef(null);

  // Load personas list on mount
  useEffect(() => {
    fetchPersonas().then(setPersonas).catch(console.error);
  }, []);

  // Load markdown whenever selected persona changes
  useEffect(() => {
    if (!selectedPersonaId) return;
    fetchPersonaMarkdown(selectedPersonaId).then(setPersonaMd).catch(() => setPersonaMd(''));
  }, [selectedPersonaId]);

  // Reset interview when persona changes
  const handlePersonaChange = useCallback((newId) => {
    const next = personas.find((p) => p.id === newId);
    setSelectedPersonaId(newId);
    setMessages([]);
    setStreamingContent('');
    setEvaluation(null);
    setError('');
    setForcedInterest(null);
    setIsManualInterest(false);
    setInterestLevel(next?.initial_interest ?? 'MÉDIO');
    setTokenInfo({ input: 0, output: 0 });
    setAttachedFile(null);
  }, [personas]);

  // Manual interest override
  const handleInterestSelect = useCallback((level) => {
    setInterestLevel(level);
    setForcedInterest(level);
    setIsManualInterest(true);
  }, []);

  const handleClearManual = useCallback(() => {
    setForcedInterest(null);
    setIsManualInterest(false);
  }, []);

  // File attachment
  const handleFileAttach = useCallback(async (file) => {
    try {
      const base64 = await fileToBase64(file);
      setAttachedFile({ file, base64, name: file.name, type: file.type });
    } catch (e) {
      setError('Erro ao processar arquivo: ' + e.message);
    }
  }, []);

  const handleFileRemove = useCallback(() => {
    setAttachedFile(null);
  }, []);

  // Drag-and-drop handlers on the <main> chat area
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidAttachment(file)) {
      handleFileAttach(file);
    }
  }, [handleFileAttach]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Only clear if leaving the main container (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  }, []);

  const sendMessage = useCallback(async (text) => {
    if ((!text.trim() && !attachedFile) || streaming) return;

    if (text.trim().toLowerCase() === '/encerrar') {
      setInput('');
      if (messages.length === 0) { setError('Inicie a entrevista antes de encerrá-la.'); return; }
      setEvaluating(true);
      setError('');
      try {
        const result = await fetchEvaluation(messages, selectedPersonaId);
        setEvaluation(result);
      } catch (e) {
        setError('Erro ao gerar avaliação: ' + e.message);
      } finally {
        setEvaluating(false);
      }
      return;
    }

    // Build content: string for text-only, array for message with image/PDF
    let userContent;
    if (attachedFile) {
      const isPdf = attachedFile.type === 'application/pdf';
      const mediaBlock = isPdf
        ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: attachedFile.base64 } }
        : { type: 'image', source: { type: 'base64', media_type: attachedFile.type, data: attachedFile.base64 } };
      userContent = [mediaBlock];
      if (text.trim()) userContent.push({ type: 'text', text: text.trim() });
    } else {
      userContent = text.trim();
    }

    const userMessage = { role: 'user', content: userContent };
    if (attachedFile) userMessage._attachmentName = attachedFile.name;

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    setError('');
    setStreaming(true);
    setStreamingContent('');

    let accumulated = '';

    await streamChat({
      messages: newMessages,
      personaId: selectedPersonaId,
      forcedInterest,
      onChunk: (chunk) => {
        accumulated += chunk;
        const partial = extractProgressiveFala(accumulated);
        if (partial !== null) setStreamingContent(partial);
      },
      onDone: ({ inputTokens, outputTokens }) => {
        setTokenInfo({ input: inputTokens, output: outputTokens });
        const { fala, interesse } = parseModelResponse(accumulated);
        if (!forcedInterest) {
          setInterestLevel(interesse);
        }
        setMessages((prev) => [...prev, { role: 'assistant', content: fala }]);
        setStreamingContent('');
        setStreaming(false);
        inputRef.current?.focus();
      },
      onError: (msg) => {
        setError('Erro na chamada à API: ' + msg);
        setStreamingContent('');
        setStreaming(false);
      },
    });
  }, [messages, streaming, selectedPersonaId, forcedInterest, attachedFile]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const resetInterview = () => {
    const current = personas.find((p) => p.id === selectedPersonaId);
    setMessages([]);
    setStreamingContent('');
    setInterestLevel(current?.initial_interest ?? 'MÉDIO');
    setForcedInterest(null);
    setIsManualInterest(false);
    setEvaluation(null);
    setError('');
    setTokenInfo({ input: 0, output: 0 });
    setAttachedFile(null);
    inputRef.current?.focus();
  };

  const exportTranscript = () => {
    const current = personas.find((p) => p.id === selectedPersonaId);
    const lines = messages.map((m) => {
      const role = m.role === 'user' ? 'ENTREVISTADOR' : (current?.name?.toUpperCase() ?? 'PERSONA');
      let contentStr;
      if (typeof m.content === 'string') {
        contentStr = m.content;
      } else if (Array.isArray(m.content)) {
        const attachName = m._attachmentName ?? 'imagem_anexada';
        const parts = [`[Imagem colada: ${attachName}]`];
        const textBlock = m.content.find((b) => b.type === 'text');
        if (textBlock?.text) parts.push(textBlock.text);
        contentStr = parts.join('\n');
      } else {
        contentStr = '';
      }
      return `**${role}:**\n${contentStr}\n`;
    });
    const content = `# Transcrição — ${current?.name ?? 'Persona'} | PLAENGE\nData: ${new Date().toLocaleString('pt-BR')}\n\n---\n\n${lines.join('\n---\n\n')}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entrevista-${selectedPersonaId}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentPersona = personas.find((p) => p.id === selectedPersonaId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-500 hover:text-gray-800 p-1 flex-shrink-0">☰</button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-plaenge-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-sm text-gray-900 leading-none">PLAENGE — Personas</p>
              <p className="text-xs text-gray-400">Gov. Celso Ramos/SC · BRAIN Research</p>
            </div>
          </div>

          {personas.length > 0 && (
            <div className="ml-2">
              <PersonaSelector
                personas={personas}
                selectedId={selectedPersonaId}
                onSelect={handlePersonaChange}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <InterestIndicator level={interestLevel} />

          <button onClick={exportTranscript} disabled={messages.length === 0}
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            ↓ Exportar
          </button>

          <button onClick={resetInterview}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            ↺ Reiniciar
          </button>

          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
            <input type="checkbox" checked={debugMode} onChange={(e) => setDebugMode(e.target.checked)} className="rounded" />
            <span className="hidden sm:inline text-gray-500">Debug</span>
          </label>
        </div>
      </header>

      {/* Debug bar */}
      {debugMode && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-800 flex flex-wrap gap-4">
          <span>Modelo: <code>claude-sonnet-4-6</code></span>
          <span>Persona: <code>{selectedPersonaId}</code></span>
          <span>Interesse forçado: <code>{forcedInterest ?? 'none'}</code></span>
          <span>Tokens in: <code>{tokenInfo.input}</code></span>
          <span>Tokens out: <code>{tokenInfo.output}</code></span>
          <span>Msgs: <code>{messages.length}</code></span>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex w-72 flex-shrink-0 flex-col gap-4 p-4 bg-white border-r border-gray-200 overflow-y-auto scrollbar-thin absolute lg:relative inset-0 z-40 lg:z-auto`}>
          <div className="flex items-center justify-between lg:hidden">
            <p className="font-semibold text-sm text-gray-700">Ficha da Persona</p>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
          </div>

          <PersonaCard
            persona={currentPersona}
            personaMd={personaMd}
            interestLevel={interestLevel}
            isManualInterest={isManualInterest}
            onInterestSelect={handleInterestSelect}
            onClearManual={handleClearManual}
          />

          <div className="sm:hidden border-t border-gray-100 pt-3">
            <button onClick={exportTranscript} disabled={messages.length === 0}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              ↓ Exportar transcrição
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/30 z-30" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Chat + input — drag-and-drop zone */}
        <main
          className="flex-1 flex flex-col overflow-hidden relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Drag-and-drop overlay */}
          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 border-2 border-dashed border-blue-400 z-10 pointer-events-none rounded-none">
              <p className="text-blue-500 font-medium text-sm">Solte aqui para anexar</p>
            </div>
          )}

          <ChatPanel
            messages={messages}
            streamingContent={streamingContent}
            isStreaming={streaming}
            personaInitials={currentPersona?.initials ?? 'P'}
          />

          {error && (
            <div className="mx-4 mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <InputArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onSend={() => sendMessage(input)}
            onEnd={() => sendMessage('/encerrar')}
            attachedFile={attachedFile}
            onFileAttach={handleFileAttach}
            onFileRemove={handleFileRemove}
            disabled={streaming || evaluating}
            streaming={streaming}
            evaluating={evaluating}
            hasMessages={messages.length > 0}
            inputRef={inputRef}
            personaName={currentPersona?.name}
            isManualInterest={isManualInterest}
            interestLevel={interestLevel}
          />
        </main>
      </div>

      {evaluation && (
        <EvalPanel evaluation={evaluation} onClose={() => setEvaluation(null)} />
      )}
    </div>
  );
}
