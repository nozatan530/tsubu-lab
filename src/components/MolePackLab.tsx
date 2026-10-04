import React, { useState } from 'react';
import { SUBSTANCES } from '../data/cards';
import { calculateMolesToQuantities } from '../utils/chemistry';
import { PACK_MAX, packChange, packFromGrams, packSetSubstance } from '../utils/operations';
import { ArrowRightLeft, BookOpen } from 'lucide-react';

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
    <div className="w-full bg-linear-to-b from-slate-900 to-slate-950 p-3 sm:p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden transition-all duration-300">
      <div
        className="absolute inset-0 opacity-15 pointer-events-none transition-all duration-300"
        style={{ backgroundImage: `radial-gradient(circle, ${theme.accent} 1.5px, transparent 1.5px)`, backgroundSize: '20px 20px' }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        {/* 物質を選ぶ */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">物質：</span>
            {Object.values(SUBSTANCES).map((s) => {
              const isSelected = s.id === substanceId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSubstanceChange(s.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                    isSelected ? 'text-white' : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  style={isSelected ? { backgroundColor: `${s.color}55`, borderColor: s.color, boxShadow: `0 0 0 2px ${s.color}66` } : {}}
                >
                  <span className="text-sm">{s.icon}</span>
                  <span>{s.formula}</span>
                  <span className="text-[10px] font-mono opacity-75">{s.molarMass}</span>
                </button>
              );
            })}
            {onOpenAnalogy && (
              <button
                type="button"
                onClick={onOpenAnalogy}
                className="ml-auto text-[11px] font-bold text-amber-200 hover:text-amber-100 underline underline-offset-2"
                title="なぜ約6000垓個も集めるのか？天秤シミュレーションを見る"
              >
                ⚖️ なぜ約6000垓個集めるの？
              </button>
            )}
          </div>
        )}

        {/* いまの物質と「1パック」の約束 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 text-sm font-bold text-white">
            <span className="text-lg">{currentSubstance.icon}</span>
            {currentSubstance.name}（{currentSubstance.formula}）
          </span>
          <span className="px-2 py-0.5 rounded-full border font-bold text-white" style={{ backgroundColor: `${theme.accent}25`, borderColor: `${theme.accent}60` }}>
            1パック ＝ 約6000垓個 ＝ {currentSubstance.molarMass} g
          </span>
          <span className="text-amber-300">
            1粒は {currentSubstance.singleParticleMass}（軽すぎて天秤に乗らない）
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* 操作（PC では左、スマホではパックの下） */}
          {!readOnly && (
            <div className="order-2 sm:order-1 sm:w-44 shrink-0 flex flex-col gap-2 sm:self-center">
              <span className="text-[11px] font-semibold text-slate-300">パック数を増やす・減らす</span>
              <div className="grid grid-cols-4 sm:grid-cols-2 gap-1.5">
                <PackButton label="-1" title="1パック減らす" onClick={() => handlePacksChange(-1)} disabled={packs < 1} />
                <PackButton label="-0.1" title="小分け1個（0.1mol）減らす" onClick={() => handlePacksChange(-0.1)} disabled={packs < 0.1} />
                <PackButton label="+0.1" title="小分け1個（0.1mol）増やす" onClick={() => handlePacksChange(0.1)} disabled={packs >= PACK_MAX} accent={theme.accent} />
                <PackButton label="+1" title="1パック増やす" onClick={() => handlePacksChange(1)} disabled={packs >= PACK_MAX} accent={theme.accent} strong />
              </div>
              <span className="text-[11px] font-semibold text-slate-300 mt-1">重さ（g）からパック数を求める</span>
              <form onSubmit={handleApplyGrams} className="flex gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    placeholder="例: 36"
                    value={inputGrams}
                    onChange={(e) => setInputGrams(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-base sm:text-xs font-mono font-bold bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">g</span>
                </div>
                <button
                  type="submit"
                  disabled={!inputGrams}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-200 rounded-lg disabled:opacity-40 flex items-center gap-1 shrink-0"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  変換
                </button>
              </form>
              {onOpenCard && (
                <button
                  type="button"
                  onClick={onOpenCard}
                  className="self-start text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  カード帳で1パックの重さを確認
                </button>
              )}
            </div>
          )}

          {/* パックの絵 */}
          <div className="order-1 sm:order-2 flex-1 min-w-0">
          {/* Visual Display of Packs / 10 Sub-unit slots */}
          <div className="w-full min-h-[150px] bg-slate-950/70 rounded-xl border border-slate-800 p-3 flex flex-wrap items-center justify-center gap-3 transition-all">
            {quantities.packs === 0 ? (
              <div className="text-slate-500 text-xs text-center py-8">
                パックがありません（0 mol）。ボタンでパックを増やしてみよう。
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

        {/* 3つの量を1行で：物質量 ＝ 粒の数 ＝ 質量 */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm font-mono">
          <span className="font-bold" style={{ color: theme.accent === '#475569' ? '#cbd5e1' : theme.accent }}>
            物質量 <strong className="text-base">{quantities.packs}</strong> mol
            <span className="font-sans text-[10px] text-slate-400 ml-1">（小分け {quantities.pieces} 個）</span>
          </span>
          <span className="text-slate-500">＝</span>
          <span className="text-sky-300">
            粒 <strong className="text-base">{quantities.formattedParticles}</strong>
          </span>
          <span className="text-slate-500">＝</span>
          <span className="text-emerald-300">
            質量 <strong className="text-base">{quantities.massG}</strong> g
          </span>
          <span className="font-sans text-[10px] text-slate-500 w-full text-center">
            {quantities.packs} mol × {quantities.molarMass} g/mol ＝ {quantities.massG} g ／ 粒の数：{currentSubstance.particleName}
          </span>
        </div>
      </div>
    </div>
  );
};

const PackButton: React.FC<{ label: string; title: string; disabled?: boolean; accent?: string; strong?: boolean; onClick: () => void }> = ({
  label,
  title,
  disabled,
  accent,
  strong,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`py-2 text-xs font-bold rounded-lg border transition-colors disabled:opacity-40 ${
      accent ? 'text-white hover:brightness-110' : 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-600'
    }`}
    style={accent ? { backgroundColor: strong ? accent : `${accent}99`, borderColor: accent } : {}}
  >
    {label}
  </button>
);
