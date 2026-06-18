import React, { useState } from 'react';

export default function PersonaSelector({ personas, selectedId, onSelect }) {
  const [pendingId, setPendingId] = useState(null);

  const confirmSwitch = () => {
    onSelect(pendingId);
    setPendingId(null);
  };

  return (
    <>
      <div className="flex gap-2">
        {personas.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => {
                if (p.id !== selectedId) setPendingId(p.id);
              }}
              title={`${p.name} · ${p.age}a · ${p.city}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                active
                  ? 'border-plaenge-600 bg-plaenge-50 text-plaenge-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${p.color}`}
              >
                {p.initials}
              </div>
              <span className="hidden sm:inline">{p.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Confirmation modal */}
      {pendingId && (() => {
        const next = personas.find((p) => p.id === pendingId);
        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Trocar de persona?</h3>
              <p className="text-sm text-gray-600">
                Trocar para <strong>{next?.name}</strong> vai limpar o histórico desta conversa.
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setPendingId(null)}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSwitch}
                  className="px-4 py-2 text-sm rounded-xl bg-plaenge-700 hover:bg-plaenge-800 text-white font-semibold"
                >
                  Confirmar e trocar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
