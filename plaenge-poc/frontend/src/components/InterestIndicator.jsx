import React from 'react';

const CONFIG = {
  ALTO:  { label: 'ALTO',  color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', bars: 3 },
  MÉDIO: { label: 'MÉDIO', color: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50  border-amber-200',   bars: 2 },
  BAIXO: { label: 'BAIXO', color: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50    border-red-200',     bars: 1 },
};

export default function InterestIndicator({ level = 'MÉDIO' }) {
  const cfg = CONFIG[level] ?? CONFIG['MÉDIO'];

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${cfg.bg}`}>
      <div className="flex items-end gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`w-2 rounded-sm transition-all duration-300 ${
              bar <= cfg.bars ? cfg.color : 'bg-gray-200'
            }`}
            style={{ height: `${bar * 8}px` }}
          />
        ))}
      </div>
      <div>
        <p className="text-xs text-gray-500 leading-none">Nível de interesse</p>
        <p className={`font-bold text-sm leading-tight ${cfg.text}`}>{cfg.label}</p>
      </div>
    </div>
  );
}
