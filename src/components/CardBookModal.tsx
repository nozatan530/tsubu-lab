import React from 'react';
import { SUBSTANCES, ATOMIC_WEIGHTS } from '../data/cards';
import { X, BookOpen, Check } from 'lucide-react';

interface CardBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedCards: string[];
}

export const CardBookModal: React.FC<CardBookModalProps> = ({
  isOpen,
  onClose,
  unlockedCards,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">モル質量カード帳</h2>
              <p className="text-xs text-slate-500">1パック（6.02×10²³個）の重さと原子量の内訳</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Atomic Weights Reference Bar */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 block mb-1">
              高校化学基礎で使う主な原子量（基準となる原子1個の相対質量）:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {Object.values(ATOMIC_WEIGHTS).map((a) => (
                <span
                  key={a.symbol}
                  className="px-2 py-0.5 bg-white rounded-md border border-slate-200 text-slate-800 font-semibold"
                >
                  {a.symbol} ＝ {a.weight}
                </span>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(SUBSTANCES).map((substance) => {
              const isUnlocked = unlockedCards.includes(substance.id);
              const theme = substance.theme;

              return (
                <div
                  key={substance.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-white border-slate-200 shadow-xs hover:border-slate-400'
                      : 'bg-slate-50/70 border-dashed border-slate-300 opacity-60'
                  }`}
                  style={isUnlocked ? { borderLeftWidth: '4px', borderLeftColor: theme.accent } : {}}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xl shadow-xs"
                        style={{ backgroundColor: `${theme.accent}1a` }}
                      >
                        {substance.icon}
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block leading-tight">{substance.name}</span>
                        <h3 className="text-lg font-bold text-slate-900 font-sans tracking-wide">
                          {substance.formula}
                        </h3>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check className="w-3 h-3" />
                        解禁済み
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        未解禁
                      </span>
                    )}
                  </div>

                  {/* 1 Pack Weight */}
                  <div
                    className="mt-3 p-2.5 rounded-lg border flex items-center justify-between"
                    style={{
                      backgroundColor: `${theme.accent}0d`,
                      borderColor: `${theme.accent}33`,
                    }}
                  >
                    <span className="text-xs font-semibold text-slate-800">1パックの重さ:</span>
                    <span
                      className="text-base font-bold font-mono"
                      style={{ color: theme.accent }}
                    >
                      {substance.molarMass} <span className="text-xs font-normal text-slate-600">g/mol</span>
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div className="mt-2 text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-sans">原子量の内訳:</span>
                    {substance.breakdown}
                  </div>

                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {substance.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
