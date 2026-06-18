import React, { useState } from 'react';

export default function InputArea({
  value,
  onChange,
  onKeyDown,
  onSend,
  onEnd,
  attachedFile,
  onFileAttach,
  onFileRemove,
  disabled,
  streaming,
  evaluating,
  hasMessages,
  inputRef,
  personaName,
  isManualInterest,
  interestLevel,
}) {
  const [pasteIndicator, setPasteIndicator] = useState(false);

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) break;
        const renamedFile = new File([file], `print_${Date.now()}.png`, { type: file.type });
        onFileRemove();
        setPasteIndicator(true);
        setTimeout(() => {
          setPasteIndicator(false);
          onFileAttach(renamedFile);
        }, 300);
        break;
      }
    }
  }

  const placeholder = streaming
    ? `${personaName ?? 'Persona'} está respondendo...`
    : 'Digite sua pergunta (Enter para enviar) · Ctrl+V para colar print · /encerrar para avaliar';

  const canSend = !disabled && (value.trim() || attachedFile);

  return (
    <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
      {/* Paste indicator */}
      {pasteIndicator && (
        <div className="mb-2">
          <span className="text-xs text-green-500 font-medium">Imagem colada ✓</span>
        </div>
      )}

      {/* Attachment preview */}
      {attachedFile && !pasteIndicator && (
        <div className="mb-2 flex items-center gap-2">
          {attachedFile.type.startsWith('image/') ? (
            <img
              src={`data:${attachedFile.type};base64,${attachedFile.base64}`}
              alt="Preview"
              className="h-14 rounded-lg object-cover border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <span className="text-lg">📄</span>
              <span className="text-xs text-gray-600 max-w-[200px] truncate">{attachedFile.name}</span>
            </div>
          )}
          <button
            onClick={onFileRemove}
            className="text-gray-400 hover:text-red-500 text-sm leading-none ml-1"
            title="Remover anexo"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          rows={2}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-plaenge-500 focus:border-transparent disabled:opacity-50 scrollbar-thin"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={onSend}
            disabled={!canSend}
            className="px-4 py-2.5 bg-plaenge-700 hover:bg-plaenge-800 text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {streaming ? '...' : 'Enviar'}
          </button>
          <button
            onClick={onEnd}
            disabled={disabled || !hasMessages}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {evaluating ? 'Gerando...' : 'Encerrar'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-1.5 ml-1">
        Entrevistando: <strong>{personaName ?? '—'}</strong> · Empreendimento PLAENGE — Gov. Celso Ramos/SC
        {isManualInterest && (
          <span className="ml-2 text-blue-400">· interesse fixado manualmente em {interestLevel}</span>
        )}
      </p>
    </div>
  );
}
