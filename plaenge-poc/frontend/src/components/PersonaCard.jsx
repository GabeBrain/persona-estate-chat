import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import InterestSelector from './InterestSelector.jsx';

export default function PersonaCard({
  persona,
  personaMd,
  interestLevel,
  isManualInterest,
  onInterestSelect,
  onClearManual,
}) {
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);

  if (!persona) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar + identity */}
      <div className="flex items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow ${persona.color}`}
        >
          {persona.initials}
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-900 leading-tight">{persona.name}</h2>
          <p className="text-sm text-gray-500">
            {persona.age} anos · {persona.city}
          </p>
          <p className="text-sm text-gray-600">{persona.occupation}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <span className="text-gray-400 block">Renda estimada</span>
          <span className="font-semibold text-gray-700">{persona.income}</span>
        </div>
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <span className="text-gray-400 block">Teto de preço</span>
          <span className="font-semibold text-gray-700">{persona.price_ceiling}</span>
        </div>
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <span className="text-gray-400 block">Produto preferido</span>
          <span className="font-semibold text-gray-700">{persona.preferred_product}</span>
        </div>
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <span className="text-gray-400 block">Perfil</span>
          <span className="font-semibold text-gray-700">{persona.profile}</span>
        </div>
      </div>

      {/* Interest selector */}
      <InterestSelector
        currentLevel={interestLevel}
        isManual={isManualInterest}
        onSelect={onInterestSelect}
        onClearManual={onClearManual}
      />

      {/* Criteria (collapsible) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setCriteriaOpen(!criteriaOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
        >
          Critérios de decisão
          <span className="text-gray-400">{criteriaOpen ? '▲' : '▼'}</span>
        </button>
        {criteriaOpen && (
          <ul className="px-4 py-3 space-y-2">
            {persona.decision_criteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-plaenge-600 font-bold flex-shrink-0">{i + 1}.</span>
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Objections */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Principais objeções
        </p>
        <ul className="space-y-1">
          {persona.main_objections.map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      {/* Full persona modal trigger */}
      {personaMd && (
        <>
          <button
            onClick={() => setShowFull(true)}
            className="text-xs text-plaenge-600 hover:text-plaenge-800 underline underline-offset-2 text-left"
          >
            Ver persona completa →
          </button>

          {showFull && (
            <div
              className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
              onClick={() => setShowFull(false)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 scrollbar-thin shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{persona.name}</h3>
                  <button
                    onClick={() => setShowFull(false)}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{personaMd}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
