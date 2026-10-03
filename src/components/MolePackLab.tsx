import React, { useState } from 'react';
import { SUBSTANCES } from '../data/cards';
import { calculateMolesToQuantities } from '../utils/chemistry';
import { PACK_MAX, packChange, packFromGrams, packSetSubstance } from '../utils/operations';
import { Package, HelpCircle, ArrowRightLeft, Sparkles } from 'lucide-react';

interface MolePackLabProps {
  substanceId: string;
  packs: number;
  onUpdate: (updates: {
    substanceId: string;
    packs: number;
    actionDescription?: string;
  }) => void;
  readOnly?: boolean;
  onOpenAnalogy?: () => void;
  onOpenCard?: () => void;
}

export const MolePackLab: React.FC<MolePackLabProps> = ({
  substanceId,
  packs,
  onUpdate,
  readOnly = false,
  onOpenAnalogy,
  onOpenCard,
}) => {
  const currentSubstance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  const quantities = calculateMolesToQuantities(packs, substanceId);
  const [inputGrams, setInputGrams] = useState<string>('');

  const handleSubstanceChange = (id: string) => {
    if (readOnly) return;
    onUpdate({
      ...packSetSubstance({ substanceId, packs }, id),
      actionDescription: `物質を ${SUBSTANCES[id].name} (${SUBSTANCES[id].formula}) に変更`,
    });
  };

  const handlePacksChange = (delta: number) => {
    if (readOnly) return;
    onUpdate({
      ...packChange({ substanceId, packs }, delta),
      actionDescription: `パック数 ${delta > 0 ? `+${delta}` : delta}mol`,
    });
  };

  const handleApplyGrams = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const val = parseFloat(inputGrams);
    if (!isNaN(val) && val >= 0) {
      const next = packFromGrams({ substanceId, packs }, val);
      onUpdate({
        ...next,
        actionDescription: `重さ ${val}g から ${Number(next.packs.toFixed(3))}mol を計算`,
      });
      setInputGrams('');
    }
  };

  // Full packs (1.0mol = 1 full crate with 10 units)
  const fullPacksCount = Math.floor(quantities.packs);
  // 端数のパック（例: 0.17mol → 小分け 1個が満杯 ＋ 2個目が7割）
  const fractionalPacks = Math.round((quantities.packs - fullPacksCount) * 100) / 100;
  const fractionalPieces = Math.round(fractionalPacks * 1000) / 100; // 小分けの個数（小数あり）
  const fractionalUnits = Math.floor(fractionalPieces + 1e-9); // 満杯の小分け
  const hasPartialUnit = fractionalPieces - fractionalUnits > 1e-9;

  const theme = currentSubstance.theme;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Substance Selection Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">物質を選ぶ:</span>
          {onOpenAnalogy && (
            <button
              type="button"
              onClick={onOpenAnalogy}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg border border-amber-300 transition-colors shadow-2xs"
              title="なぜ約6000垓個も集めるのか？天秤シミュレーションを見る"
            >
              <span>⚖️ なぜ約6000垓個集めるの？</span>
            </button>
          )}
        </div>

        {/* Substance Buttons with distinct colors & icons */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.values(SUBSTANCES).map((s) => {
            const isSelected = s.id === substanceId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSubstanceChange(s.id)}
                disabled={readOnly}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md ring-2 scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
                style={isSelected ? { borderColor: s.color, boxShadow: `0 0 0 2px ${s.color}66` } : {}}
              >
                <span className="text-sm">{s.icon}</span>
                <span>{s.formula}</span>
                <span
                  className="text-[10px] font-mono px-1 py-0.2 rounded-xs"
                  style={{
                    backgroundColor: isSelected ? `${s.color}33` : 'transparent',
                    color: isSelected ? '#ffffff' : '#64748b',
                  }}
                >
                  {s.molarMass}g/mol
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Pack Stage with Dynamic Substance Color & Icons */}
      <div className="w-full bg-linear-to-b from-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden transition-all duration-300">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none transition-all duration-300"
          style={{
            backgroundImage: `radial-gradient(circle, ${theme.accent} 1.5px, transparent 1.5px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Header banner showing the active substance name, icon, and 1-pack definition */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-3 gap-2 text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-2">
              <span className="text-lg">{currentSubstance.icon}</span>
              <span className="text-sm font-bold text-white">
                {currentSubstance.name} ({currentSubstance.formula})
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${theme.accent}25`,
                  borderColor: `${theme.accent}60`,
                  color: '#ffffff',
                }}
              >
                1パックの重さ: {currentSubstance.molarMass} g/mol
              </span>
            </span>

            <span className="font-mono text-[11px] text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700 self-start sm:self-auto">
              1パック ＝ 約6000垓個（6.02×10²³個） ｜ 小分け1個 ＝ 0.1mol
            </span>
          </div>

          {/* Direct explanation of why we gather ~6000-gai particles */}
          <div className="w-full mb-3 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <span>🔬</span>
              <span>
                1粒の質量: <strong>{currentSubstance.singleParticleMass}</strong>（軽すぎて天秤に乗らない！）
              </span>
            </span>
            <span className="text-emerald-300 font-medium">
              ➔ だから約6000垓個（1パック）集めて天秤で測れる <strong>{currentSubstance.molarMass} g</strong> にする！
            </span>
          </div>

          {/* Visual Display of Packs / 10 Sub-unit slots */}
          <div className="w-full min-h-[170px] bg-slate-950/70 rounded-xl border border-slate-800 p-4 flex flex-wrap items-center justify-center gap-4 transition-all">
            {quantities.packs === 0 ? (
              <div className="text-slate-500 text-xs text-center py-8">
                パックがありません（0 mol）。操作パネルからパックを増やしてみましょう。
              </div>
            ) : (
              <>
                {/* Full Packs (Each crate has 10 filled slots of this substance) */}
                {Array.from({ length: fullPacksCount }).map((_, packIdx) => (
                  <div
                    key={`full-pack-${packIdx}`}
                    className="flex flex-col items-center p-2.5 rounded-xl shadow-lg border-2 transition-all"
                    style={{
                      backgroundColor: `${theme.accent}15`,
                      borderColor: theme.accent,
                    }}
                  >
                    <div className="text-[11px] font-bold mb-1.5 flex items-center gap-1.5 text-white">
                      <span>📦 1パック（1.0mol）</span>
                      <span className="text-slate-300 font-normal">
                        ＝ {currentSubstance.molarMass}g
                      </span>
                    </div>

                    {/* 10-slot grid inside the pack (5 x 2) */}
                    <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-900/90 rounded-lg border border-slate-700/80">
                      {Array.from({ length: 10 }).map((_, slotIdx) => (
                        <div
                          key={`full-slot-${slotIdx}`}
                          className={`w-6 h-6 rounded-md flex items-center justify-center shadow-xs transition-transform hover:scale-110 ${theme.activeSlot}`}
                          title={`小分け 0.1mol (${currentSubstance.name})`}
                        >
                          <span className="text-xs select-none">
                            {currentSubstance.icon}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[9px] text-slate-400 mt-1">
                      小分け10個入り（満杯）
                    </div>
                  </div>
                ))}

                {/* Fractional Pack (If partial units exist, e.g. 0.3mol = 3 active slots) */}
                {fractionalPacks > 0 && (
                  <div
                    className="flex flex-col items-center p-2.5 rounded-xl shadow-md border-2 border-dashed transition-all"
                    style={{
                      backgroundColor: `${theme.accent}0d`,
                      borderColor: `${theme.accent}80`,
                    }}
                  >
                    <div className="text-[11px] font-bold mb-1.5 flex items-center gap-1.5 text-white">
                      <span>📦 {fractionalPacks}パック（小分け {fractionalPieces}個分）</span>
                      <span className="text-slate-300 font-normal">
                        ＝ {((Math.max(0, packs) - fullPacksCount) * currentSubstance.molarMass).toFixed(1)}g
                      </span>
                    </div>

                    {/* 10-slot grid with only active slots filled */}
                    <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-900/90 rounded-lg border border-slate-700/80">
                      {Array.from({ length: 10 }).map((_, slotIdx) => {
                        const isActive = slotIdx < fractionalUnits;
                        const isPartial = hasPartialUnit && slotIdx === fractionalUnits;
                        return (
                          <div
                            key={`frac-slot-${slotIdx}`}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                              isActive
                                ? `${theme.activeSlot} shadow-xs scale-102`
                                : isPartial
                                ? `${theme.activeSlot} opacity-50 border border-dashed border-white/60`
                                : 'bg-slate-800/60 border border-slate-700/40 text-slate-600'
                            }`}
                            title={isActive ? `小分け 0.1mol (${currentSubstance.name})` : isPartial ? '小分けの一部（0.1mol 未満）' : '空の枠'}
                          >
                            {isActive || isPartial ? (
                              <span className="text-xs select-none">
                                {currentSubstance.icon}
                              </span>
                            ) : (
                              <span className="text-[9px] opacity-40">○</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[9px] text-slate-400 mt-1">
                      10枠中 {fractionalPieces}枠分（{fractionalPacks}パック）
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized 3-Way Metrics Readout Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 border-b border-slate-100 pb-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3つの量の同時表示（同じ状態を異なる単位で見比べる）</span>
          </span>
          <span className="text-[11px] text-slate-400">1mol ＝ 6.02×10²³個 ＝ 1パックの重さ(g)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          {/* Moles (Packs) */}
          <div
            className="border rounded-lg p-3 transition-colors"
            style={{
              backgroundColor: `${theme.accent}0d`,
              borderColor: `${theme.accent}40`,
            }}
          >
            <span
              className="text-[11px] font-bold block"
              style={{ color: theme.accent }}
            >
              物質量（パック数）
            </span>
            <div className="mt-1">
              <span
                className="text-2xl font-bold font-mono tabular-nums"
                style={{ color: theme.accent }}
              >
                {quantities.packs}
              </span>
              <span className="text-xs font-semibold ml-1 text-slate-700">mol（パック）</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              （小分け {quantities.pieces} 個分）
            </span>
          </div>

          {/* Particle Count */}
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-sky-800 block">
              粒の数（{currentSubstance.particleName}）
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-sky-700 tabular-nums">
                {quantities.formattedParticles}
              </span>
            </div>
            <span className="text-[10px] text-sky-600/80 mt-0.5 block">
              {quantities.packs} × (6.02 × 10²³)
            </span>
          </div>

          {/* Mass in grams */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-emerald-800 block">
              重さ（天秤で測れる質量）
            </span>
            <div className="mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                {quantities.massG}
              </span>
              <span className="text-xs font-semibold ml-1 text-emerald-800">g</span>
            </div>
            <span className="text-[10px] text-emerald-600/80 mt-0.5 block">
              {quantities.packs} × {quantities.molarMass}g/mol
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons & Mass Calculator */}
      {!readOnly && (
        <div className="bg-slate-100/80 p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>操作パネル</span>
            {onOpenCard && (
              <button
                type="button"
                onClick={onOpenCard}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
              >
                <span>🃏 カード帳で確認</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct Pack adjustments */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-slate-600">
                パック数を増減（±1パック / ±0.1小分け）
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePacksChange(-1)}
                  disabled={packs < 1}
                  className="py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 active:bg-slate-300 rounded-lg border border-slate-300 disabled:opacity-40 transition-colors"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handlePacksChange(-0.1)}
                  disabled={packs < 0.1}
                  className="py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 active:bg-slate-300 rounded-lg border border-slate-300 disabled:opacity-40 transition-colors"
                >
                  -0.1
                </button>
                <button
                  type="button"
                  onClick={() => handlePacksChange(0.1)}
                  disabled={packs >= PACK_MAX}
                  className="py-2 text-xs font-bold text-slate-900 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded-lg border border-slate-300 disabled:opacity-40 transition-colors"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  onClick={() => handlePacksChange(1)}
                  disabled={packs >= PACK_MAX}
                  className="py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg border border-slate-900 disabled:opacity-40 transition-colors"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Mass input calculation */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-slate-600">
                重さ（g）を入力してパック数を求める
              </span>
              <form onSubmit={handleApplyGrams} className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="例: 36"
                    value={inputGrams}
                    onChange={(e) => setInputGrams(e.target.value)}
                    className="w-full py-2 px-3 text-xs font-mono font-bold bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-500"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-sans pointer-events-none">
                    g
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!inputGrams}
                  className="px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>変換</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
