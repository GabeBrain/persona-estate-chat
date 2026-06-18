import React from 'react';
import InterestIndicator from './InterestIndicator.jsx';

export default function EvalPanel({ evaluation, onClose }) {
  if (!evaluation) return null;

  const { resumo, nivel_interesse_final, principais_objecoes, pontos_positivos, proximos_passos } = evaluation;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-plaenge-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Avaliação da Entrevista</h2>
            <p className="text-plaenge-200 text-sm">Gerada automaticamente pela IA</p>
          </div>
          <button onClick={onClose} className="text-plaenge-200 hover:text-white text-2xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Interest level */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nível de interesse final</p>
            <InterestIndicator level={nivel_interesse_final} />
          </div>

          {/* Summary */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resumo da conversa</p>
            <p className="text-sm text-gray-700 leading-relaxed">{resumo}</p>
          </div>

          {/* Objections */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Principais objeções identificadas</p>
            <ul className="space-y-1">
              {principais_objecoes?.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-400 flex-shrink-0 font-bold">✕</span> {o}
                </li>
              ))}
            </ul>
          </div>

          {/* Positives */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pontos que geraram interesse</p>
            <ul className="space-y-1">
              {pontos_positivos?.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 flex-shrink-0 font-bold">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Next steps */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recomendações de próximos passos</p>
            <ul className="space-y-1">
              {proximos_passos?.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-plaenge-600 flex-shrink-0 font-bold">→</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-plaenge-700 hover:bg-plaenge-800 text-white font-semibold rounded-xl py-2.5 transition-colors"
          >
            Fechar avaliação
          </button>
        </div>
      </div>
    </div>
  );
}
