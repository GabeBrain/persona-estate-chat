import React, { useRef, useEffect } from 'react';

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function MessageContent({ content, isStreaming }) {
  if (typeof content === 'string') {
    return (
      <>
        {content}
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse align-middle" />
        )}
      </>
    );
  }

  if (Array.isArray(content)) {
    return (
      <div className="flex flex-col gap-2">
        {content.map((block, i) => {
          if (block.type === 'image') {
            const src = `data:${block.source.media_type};base64,${block.source.data}`;
            return (
              <img
                key={i}
                src={src}
                alt="Imagem anexada"
                className="max-w-full rounded-lg max-h-48 object-contain border border-gray-200"
              />
            );
          }
          if (block.type === 'document') {
            return (
              <div key={i} className="flex items-center gap-2 text-xs opacity-80">
                <span>📄</span>
                <span>Documento PDF anexado</span>
              </div>
            );
          }
          if (block.type === 'text' && block.text) {
            return <span key={i}>{block.text}</span>;
          }
          return null;
        })}
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    );
  }

  return null;
}

function Message({ role, content, isStreaming, isTyping, personaInitials }) {
  const isPersona = role === 'assistant';

  return (
    <div className={`flex gap-3 ${isPersona ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${
        isPersona ? 'bg-plaenge-700 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {isPersona ? (personaInitials ?? 'P') : 'E'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isPersona
          ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
          : 'bg-plaenge-700 text-white rounded-tr-none'
      }`}>
        {isTyping ? (
          <TypingDots />
        ) : (
          <MessageContent content={content} isStreaming={isStreaming} />
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, streamingContent, isStreaming, personaInitials }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isStreaming]);

  const showTypingDots = isStreaming && !streamingContent;
  const showStreamingBubble = isStreaming && streamingContent;

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
        <div className="text-5xl mb-4">💬</div>
        <p className="text-base font-medium text-gray-500">Inicie a entrevista</p>
        <p className="text-sm mt-1">Digite sua primeira pergunta abaixo para começar a conversa.</p>
        <p className="text-xs mt-3 text-gray-300">
          Arraste imagens para a área do chat · Cole prints com{' '}
          <code className="bg-gray-100 text-gray-500 px-1 rounded">Ctrl+V</code>
          {' '}· Use{' '}
          <code className="bg-gray-100 text-gray-500 px-1 rounded">/encerrar</code> para avaliar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
      {messages.map((msg, i) => (
        <Message
          key={i}
          role={msg.role}
          content={msg.content}
          personaInitials={personaInitials}
        />
      ))}

      {showTypingDots && (
        <Message role="assistant" isTyping personaInitials={personaInitials} />
      )}

      {showStreamingBubble && (
        <Message
          role="assistant"
          content={streamingContent}
          isStreaming
          personaInitials={personaInitials}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
