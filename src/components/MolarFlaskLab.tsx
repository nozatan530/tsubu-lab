import React, { useState } from 'react';
import { SUBSTANCES } from '../data/cards';
import { calculateMolarConcentration, calculateMassToMoles } from '../utils/chemistry';
import { Beaker, Droplets, Target, Split, AlertCircle, Sparkles, Scale } from 'lucide-react';

interface MolarFlaskLabProps {
  substanceId: string;
  packs: number;
  waterML: number;
  onUpdate: (updates: {
    substanceId?: string;
    packs: number;
    waterML: number;
    actionDescription?: string;
  }) => void;
  readOnly?: boolean;
}

// 容器の最大目盛りと、標線合わせができる目盛り
const FLASK_MAX_ML = 1200;
const FLASK_MARKS_ML = [100, 200, 500, 1000];

export const MolarFlaskLab: React.FC<MolarFlaskLabProps> = ({
  substanceId,
  packs,
  waterML,
  onUpdate,
  readOnly = false,
}) => {
  const currentSubstance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  const calc = calculateMolarConcentration(packs, waterML, substanceId);
  const [selectedMark, setSelectedMark] = useState<number>(1000); // 100, 200, 500, or 1000 mL
  const [inputGrams, setInputGrams] = useState<string>('');

  const handlePacksChange = (delta: number) => {
    if (readOnly) return;
    const nextPacks = Math.max(0, Math.min(5, Math.round((packs + delta) * 100) / 100));
    onUpdate({
      packs: nextPacks,
      waterML,
      actionDescription: `パック ${delta > 0 ? `+${delta}` : delta}mol`,
    });
  };

  const handleWaterChange = (delta: number) => {
    if (readOnly) return;
    const nextWater = Math.max(0, Math.min(1200, waterML + delta));
    onUpdate({
      packs,
      waterML: nextWater,
      actionDescription: `水 ${delta > 0 ? `+${delta}` : delta}mL`,
    });
  };

  // 天秤で量った溶質（g）をフラスコに加える（g → mol の換算）
  const handleAddGrams = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const grams = parseFloat(inputGrams);
    if (isNaN(grams) || grams <= 0) return;
    const addedPacks = calculateMassToMoles(grams, substanceId);
    const nextPacks = Math.min(5, packs + addedPacks);
    onUpdate({
      packs: nextPacks,
      waterML,
      actionDescription: `${currentSubstance.formula} ${grams}g（${Number(addedPacks.toFixed(3))}mol）を加える`,
    });
    setInputGrams('');
  };

  const handleAlignToMark = (targetML: number) => {
    if (readOnly) return;
    setSelectedMark(targetML);
    // Solute expands volume: water + soluteContribution = targetML
    // Therefore waterML = Math.max(0, targetML - soluteContribution)
    const soluteVol = packs * currentSubstance.volumePerMolML;
    const targetWater = Math.max(0, targetML - soluteVol);
    onUpdate({
      packs,
      waterML: targetWater,
      actionDescription: `標線 ${targetML}mL まで水を合わせる`,
    });
  };

  const handleTakeOut = (type: 'half' | '100ml') => {
    if (readOnly || calc.solutionVolumeML <= 0) return;
    if (type === 'half') {
      // 溶質も水も同じ割合で減らす（丸めると濃度がずれる）
      const nextPacks = packs * 0.5;
      const nextWater = waterML * 0.5;
      onUpdate({
        packs: nextPacks,
        waterML: nextWater,
        actionDescription: '半分くみ出す',
      });
    } else {
      const ratio = 100 / calc.solutionVolumeML;
      if (ratio >= 1) return;
      const nextPacks = Math.max(0, packs * (1 - ratio));
      const nextWater = Math.max(0, waterML * (1 - ratio));
      onUpdate({
        packs: nextPacks,
        waterML: nextWater,
        actionDescription: '100mLくみ出す',
      });
    }
  };

  // Percentage height for the flask (max 1200mL scale)
  const fillPct =
    calc.solutionVolumeML <= 0 ? 4 : Math.min(100, Math.max(1, (calc.solutionVolumeML / FLASK_MAX_ML) * 100));

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Volumetric Flask Stage */}
      <div className="w-full bg-linear-to-b from-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Beaker className="w-4 h-4 text-emerald-400" />
              <span>メスフラスコ型 容器（目盛り付き）</span>
            </span>
            <span className="font-mono text-emerald-300 text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
              溶液全体の体積: {calc.solutionVolumeML} mL（{calc.solutionVolumeL.toFixed(2)} L）
            </span>
          </div>

          {/* Measuring Flask Graphic */}
          <div className="relative w-52 sm:w-64 h-64 sm:h-72 flex flex-col items-center justify-end pb-3">
            {/* Flask Neck at top */}
            <div className="w-16 h-20 border-x-4 border-slate-400/40 relative z-20" />

            {/* Flask Bulb / Body at bottom */}
            <div className="relative w-48 sm:w-56 h-48 sm:h-52 bg-slate-900/60 rounded-b-[40px] rounded-t-2xl border-x-4 border-b-4 border-slate-400/40 shadow-inner flex flex-col justify-end p-2 overflow-hidden">
              {/* Calibration Marks：液面と同じ基準（最大 1200mL）で位置を決める */}
              <div className="absolute inset-2 select-none pointer-events-none z-30">
                {FLASK_MARKS_ML.map((ml) => (
                  <div
                    key={ml}
                    className="absolute left-0 right-0 flex items-center gap-1 translate-y-1/2"
                    style={{ bottom: `${(ml / FLASK_MAX_ML) * 100}%` }}
                  >
                    <div className={ml === 1000 ? 'w-full h-[2px] bg-rose-500/80 absolute left-0' : 'w-3 h-[1.5px] bg-emerald-400/80'} />
                    <span
                      className={`relative text-[9px] font-mono font-bold px-0.5 rounded-xs bg-slate-950/50 ${
                        ml === 1000 ? 'text-rose-300 ml-1' : 'text-emerald-300'
                      }`}
                    >
                      {ml === 1000 ? '標線 1L' : `${ml}mL`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Liquid inside flask */}
              <div
                className="w-full bg-linear-to-b from-emerald-400/60 to-emerald-700/80 rounded-b-[34px] relative transition-all duration-300 ease-out overflow-hidden flex flex-wrap items-center justify-center p-3 gap-2"
                style={{ height: `${fillPct}%` }}
              >
                {/* Surface Meniscus highlight */}
                <div className="absolute top-0 inset-x-0 h-2 bg-emerald-200/50 blur-[1px]" />

                {/* Floating/Dissolved Packs Inside Liquid */}
                {calc.packs > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 z-20">
                    {Array.from({ length: Math.ceil(calc.packs) }).map((_, idx) => (
                      <div
                        key={`flask-pack-${idx}`}
                        className="p-1 px-2 rounded-md text-white text-[10px] font-mono font-bold shadow-md flex items-center gap-1 animate-pulse border border-white/30"
                        style={{ backgroundColor: currentSubstance.theme.accent }}
                      >
                        <span>{currentSubstance.icon}</span>
                        <span>{idx === Math.ceil(calc.packs) - 1 && calc.packs % 1 !== 0 ? Number((calc.packs % 1).toFixed(3)) : '1.0'}mol</span>
                      </div>
                    ))}
                  </div>
                )}

                {calc.solutionVolumeML === 0 && (
                  <div className="text-emerald-200/50 text-[10px] font-sans">空（から）</div>
                )}
              </div>
            </div>
          </div>

          {/* Solute Volume Expansion Insight Note */}
          <div className="w-full mt-2 p-2 bg-slate-800/90 border border-slate-700 rounded-xl text-[11px] text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                溶質による体積の増加: <strong className="text-amber-300 font-mono">+{calc.soluteVolumeContributionML} mL</strong>
                <span className="text-slate-400 text-[10px] ml-1">（※説明用の目安）</span>
              </span>
            </span>
            <span className="text-emerald-300 text-[11px] font-medium hidden sm:inline">
              水 {calc.waterML}mL ＋ 溶質 {calc.soluteVolumeContributionML}mL ＝ 溶液全体 {calc.solutionVolumeML}mL
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Readout Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>モル濃度表示（溶液1Lあたり何パックあるか）</span>
          </span>
          <span className="text-[11px] text-slate-400">モル濃度 ＝ パック数(mol) ÷ 溶液体積(L)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          {/* Packs */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-amber-800 block">溶質のパック数</span>
            <div className="mt-1">
              <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">{calc.packs}</span>
              <span className="text-xs font-semibold ml-1 text-amber-800">mol（パック）</span>
            </div>
          </div>

          {/* Solution Volume */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-emerald-800 block">溶液全体の体積</span>
            <div className="mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                {calc.solutionVolumeML}
              </span>
              <span className="text-xs font-semibold ml-1 text-emerald-800">mL</span>
              <span className="text-xs text-slate-500 block font-normal mt-0.5">
                （＝ {calc.solutionVolumeL.toFixed(3)} L）
              </span>
            </div>
          </div>

          {/* Molar Concentration */}
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-purple-800 block">モル濃度</span>
            <div className="mt-1">
              <span className="text-2xl font-bold font-mono text-purple-700 tabular-nums">
                {calc.formattedConcentration}
              </span>
              <span className="text-xs font-semibold ml-1 text-purple-800">mol/L</span>
            </div>
            <span className="text-[10px] text-purple-600/80 mt-0.5 block">
              （1Lあたり {calc.formattedConcentration} パック）
            </span>
          </div>
        </div>
      </div>

      {/* Control Deck */}
      {!readOnly && (
        <div className="bg-slate-100/80 p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>操作パネル</span>
            <span className="text-[11px] font-normal text-slate-500">パック・水の量・標線合わせ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Solute packs */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-amber-800">パックを入れる・減らす</span>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => handlePacksChange(-1)}
                  disabled={packs < 1}
                  className="py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 rounded-lg border border-slate-300 disabled:opacity-40 transition-colors"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handlePacksChange(-0.1)}
                  disabled={packs < 0.1}
                  className="py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 rounded-lg border border-slate-300 disabled:opacity-40 transition-colors"
                >
                  -0.1
                </button>
                <button
                  type="button"
                  onClick={() => handlePacksChange(0.1)}
                  disabled={packs >= 5}
                  className="py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 disabled:opacity-40 transition-colors"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  onClick={() => handlePacksChange(1)}
                  disabled={packs >= 5}
                  className="py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg border border-amber-400 disabled:opacity-40 transition-colors"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Water additions */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-sky-800">水を足す</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleWaterChange(10)}
                  disabled={calc.solutionVolumeML >= 1200}
                  className="flex-1 py-1.5 text-xs font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 rounded-lg border border-sky-300 disabled:opacity-40 transition-colors"
                >
                  +10mL
                </button>
                <button
                  type="button"
                  onClick={() => handleWaterChange(100)}
                  disabled={calc.solutionVolumeML >= 1200}
                  className="flex-1 py-1.5 text-xs font-bold text-sky-950 bg-sky-200 hover:bg-sky-300 rounded-lg border border-sky-400 disabled:opacity-40 transition-colors"
                >
                  +100mL
                </button>
              </div>
            </div>

            {/* Align to mark (メスフラスコ標線合わせ) */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-600" />
                <span>標線まで水を合わせる</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleAlignToMark(100)}
                  className="flex-1 py-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg border border-emerald-300 transition-colors"
                >
                  100mL
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignToMark(200)}
                  className="flex-1 py-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg border border-emerald-300 transition-colors"
                >
                  200mL
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignToMark(500)}
                  className="flex-1 py-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg border border-emerald-300 transition-colors"
                >
                  500mL
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignToMark(1000)}
                  className="flex-1 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  1L
                </button>
              </div>
            </div>

            {/* Take out part */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                <Split className="w-3 h-3 text-slate-500" />
                <span>一部をくみ出す</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleTakeOut('half')}
                  disabled={calc.solutionVolumeML < 20}
                  className="flex-1 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 rounded-lg border border-slate-300 disabled:opacity-40 transition-colors"
                >
                  半分
                </button>
                <button
                  type="button"
                  onClick={() => handleTakeOut('100ml')}
                  disabled={calc.solutionVolumeML < 150}
                  className="flex-1 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 rounded-lg border border-slate-300 disabled:opacity-40 transition-colors"
                >
                  100mL
                </button>
              </div>
            </div>
          </div>

          {/* Add solute by mass (g → mol) */}
          <div className="flex flex-col gap-1 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-medium text-amber-800 flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-600" />
              <span>天秤で量った {currentSubstance.formula} を重さ（g）で入れる（1パック ＝ {currentSubstance.molarMass}g）</span>
            </span>
            <form onSubmit={handleAddGrams} className="flex gap-1.5 max-w-sm">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="any"
                  min="0"
                  inputMode="decimal"
                  placeholder="例: 1.5"
                  value={inputGrams}
                  onChange={(e) => setInputGrams(e.target.value)}
                  className="w-full py-1.5 px-3 text-xs font-mono font-bold bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-500"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-sans pointer-events-none">g</span>
              </div>
              <button
                type="submit"
                disabled={!inputGrams || packs >= 5}
                className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg border border-amber-400 disabled:opacity-40 transition-colors"
              >
                加える
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
