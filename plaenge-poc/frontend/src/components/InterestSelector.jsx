import React from 'react';

const LEVELS = ['BAIXO', 'MÉDIO', 'ALTO'];

const CONFIG = {
  ALTO:  { bg: 'bg-emerald-100 text-emerald-700 border-emerald-400', icon: '↑' },
  MÉDIO: { bg: 'bg-amber-100  text-amber-700  border-amber-400',  icon: '→' },
  BAIXO: { bg: 'bg-red-100    text-red-700    border-red-400',    icon: '↓' },
};

export default function InterestSelector({ currentLevel, isManual, onSelect, onClearManual }) {
  return (
    <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-xl bg-white">
      <div className="flex items-center justify-between min-h-[18px]">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Nível de interesse
        </span>
        {isManual && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-blue-500 italic">manual</span>
            <button
              onClick={onClearManual}
              className="text-blue-400 hover:text-blue-600 text-xs leading-none"
              title="Remover ajuste manual"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-1.5">
        {LEVELS.map((level) => {
          const cfg = CONFIG[level];
          const active = currentLevel === level;
          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className={`flex-1 py-1.5 px-1 text-xs font-bold border-2 rounded-lg transition-all ${
                active ? cfg.bg + ' border-2' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
              }`}
            >
              {cfg.icon} {level}
            </button>
          );
        })}
      </div>
    </div>
  );
}
