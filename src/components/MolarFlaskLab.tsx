import React, { useState } from 'react';
import { SUBSTANCES } from '../data/cards';
import { calculateMolarConcentration, calculateSolutionMass } from '../utils/chemistry';
import {
  FlaskState,
  FLASK_CAPACITY_ML,
  flaskMaxPacks,
  flaskVolumeML,
  flaskAddGrams,
  flaskAlignToMark,
  flaskChangePacks,
  flaskChangeWater,
  flaskTakeOut,
} from '../utils/operations';
import { Beaker } from 'lucide-react';

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
  showMassAndDensity?: boolean; // 単元④：溶液の質量・密度・質量パーセント濃度も表示する
}

// 容器の最大目盛りと、標線合わせができる目盛り
const FLASK_MAX_ML = FLASK_CAPACITY_ML;
const FLASK_MARKS_ML = [100, 200, 500, 1000];

export const MolarFlaskLab: React.FC<MolarFlaskLabProps> = ({
  substanceId,
  packs,
  waterML,
  onUpdate,
  readOnly = false,
  showMassAndDensity = false,
}) => {
  const currentSubstance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  const calc = calculateMolarConcentration(packs, waterML, substanceId);
  const massInfo = calculateSolutionMass(packs, waterML, substanceId);
  const [inputGrams, setInputGrams] = useState<string>('');

  const state: FlaskState = { substanceId, packs, waterML };

  const handlePacksChange = (delta: number) => {
    if (readOnly) return;
    onUpdate({ ...flaskChangePacks(state, delta), actionDescription: `パック ${delta > 0 ? `+${delta}` : delta}mol` });
  };

  const handleWaterChange = (delta: number) => {
    if (readOnly) return;
    onUpdate({ ...flaskChangeWater(state, delta), actionDescription: `水 ${delta > 0 ? `+${delta}` : delta}mL` });
  };

  // 天秤で量った溶質（g）をフラスコに加える（g → mol の換算）
  const handleAddGrams = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const grams = parseFloat(inputGrams);
    if (isNaN(grams) || grams <= 0) return;
    const next = flaskAddGrams(state, grams);
    onUpdate({
      ...next,
      actionDescription: `${currentSubstance.formula} ${grams}g（${Number((next.packs - packs).toFixed(3))}mol）を加える`,
    });
    setInputGrams('');
  };

  const handleAlignToMark = (targetML: number) => {
    if (readOnly) return;
    onUpdate({ ...flaskAlignToMark(state, targetML), actionDescription: `標線 ${targetML}mL まで水を合わせる` });
  };

  const handleTakeOut = (type: 'half' | '100ml') => {
    if (readOnly || calc.solutionVolumeML <= 0) return;
    onUpdate({ ...flaskTakeOut(state, type), actionDescription: type === 'half' ? '半分くみ出す' : '100mLくみ出す' });
  };

  // Percentage height for the flask (max 1200mL scale)
  const fillPct =
    calc.solutionVolumeML <= 0 ? 4 : Math.min(100, Math.max(1, (calc.solutionVolumeML / FLASK_MAX_ML) * 100));

  const isFull = flaskVolumeML(state) >= FLASK_CAPACITY_ML - 1e-9;
  const canAddPacks = packs < flaskMaxPacks(state) - 1e-9;

  return (
    <div className="w-full bg-linear-to-b from-slate-900 to-slate-950 p-3 sm:p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <span className="font-semibold flex items-center gap-1.5">
            <Beaker className="w-4 h-4 text-emerald-400" />
            標線付きの容器（溶液全体を標線に合わせる）
          </span>
          <span
            className="px-2 py-0.5 rounded-full border text-[11px] font-bold text-white"
            style={{ backgroundColor: `${currentSubstance.theme.accent}40`, borderColor: currentSubstance.theme.accent }}
          >
            {currentSubstance.icon} 溶質：{currentSubstance.formula}（1パック ＝ {currentSubstance.molarMass} g）
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* 入れる操作（PC では左） */}
          {!readOnly && (
            <div className="order-2 sm:order-1 sm:w-44 shrink-0 flex flex-col gap-1.5">
              <GroupLabel>溶質のパックを入れる・減らす</GroupLabel>
              <div className="grid grid-cols-4 sm:grid-cols-2 gap-1.5">
                <DeckButton label="-1" onClick={() => handlePacksChange(-1)} disabled={packs < 1} />
                <DeckButton label="-0.1" onClick={() => handlePacksChange(-0.1)} disabled={packs < 0.1} />
                <DeckButton label="+0.1" tone="amber" onClick={() => handlePacksChange(0.1)} disabled={!canAddPacks} />
                <DeckButton label="+1" tone="amber" strong onClick={() => handlePacksChange(1)} disabled={!canAddPacks} />
              </div>
              <GroupLabel>溶質を重さ（g）で入れる</GroupLabel>
              <form onSubmit={handleAddGrams} className="flex gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    placeholder="例: 1.5"
                    value={inputGrams}
                    onChange={(e) => setInputGrams(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-base sm:text-xs font-mono font-bold bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">g</span>
                </div>
                <button
                  type="submit"
                  disabled={!inputGrams || !canAddPacks}
                  className="px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-200 rounded-lg disabled:opacity-40 shrink-0"
                >
                  加える
                </button>
              </form>
              <GroupLabel>水を足す</GroupLabel>
              <div className="grid grid-cols-2 gap-1.5">
                <DeckButton label="+10mL" tone="sky" onClick={() => handleWaterChange(10)} disabled={isFull} />
                <DeckButton label="+100mL" tone="sky" strong onClick={() => handleWaterChange(100)} disabled={isFull} />
              </div>
            </div>
          )}

          {/* 容器 */}
          <div className="order-1 sm:order-2 flex-1 flex justify-center">
            {/* Measuring Flask Graphic */}
            <div className="relative w-48 sm:w-56 h-56 sm:h-64 flex flex-col items-center justify-end">
              {/* Flask Neck at top */}
              <div className="w-14 h-14 sm:h-16 border-x-4 border-slate-400/40 relative z-20" />

              {/* Flask Bulb / Body at bottom */}
              <div className="relative w-44 sm:w-52 h-42 sm:h-48 bg-slate-900/60 rounded-b-[40px] rounded-t-2xl border-x-4 border-b-4 border-slate-400/40 shadow-inner flex flex-col justify-end p-2 overflow-hidden">
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
                  className="w-full bg-linear-to-b from-emerald-400/60 to-emerald-700/80 rounded-b-[34px] relative transition-all duration-300 ease-out overflow-hidden flex flex-wrap items-center justify-center pl-14 pr-2 py-2 gap-2"
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

          </div>

          {/* 合わせる・くみ出す操作（PC では右） */}
          {!readOnly && (
            <div className="order-3 sm:w-40 shrink-0 flex flex-col gap-1.5">
              <GroupLabel>標線まで水を合わせる</GroupLabel>
              <div className="grid grid-cols-4 sm:grid-cols-2 gap-1.5">
                {FLASK_MARKS_ML.map((ml) => (
                  <DeckButton key={ml} label={ml === 1000 ? '1L' : `${ml}mL`} tone="emerald" strong={ml === 1000} onClick={() => handleAlignToMark(ml)} />
                ))}
              </div>
              <GroupLabel>一部をくみ出す</GroupLabel>
              <div className="grid grid-cols-2 gap-1.5">
                <DeckButton label="半分" onClick={() => handleTakeOut('half')} disabled={calc.solutionVolumeML < 20} />
                <DeckButton label="100mL" onClick={() => handleTakeOut('100ml')} disabled={calc.solutionVolumeML < 150} />
              </div>
            </div>
          )}
        </div>

        {/* 体積：水 ＋ 溶質 ＝ 溶液全体 */}
        <div className="px-2 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs font-mono text-slate-300">
          <span className="text-sky-300">水 {calc.waterML}mL</span>
          <span className="text-slate-500">＋</span>
          <span className="text-amber-300">溶質 {calc.soluteVolumeContributionML}mL</span>
          <span className="font-sans text-[10px] text-slate-500">（溶けたときの体積の目安）</span>
          <span className="text-slate-500">＝</span>
          <span className="text-emerald-300 font-bold">溶液全体 {calc.solutionVolumeML}mL</span>
        </div>

        {/* モル濃度：パック数 ÷ 溶液の体積 */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm font-mono">
          <span className="text-amber-300">
            パック <strong className="text-base">{calc.packs}</strong> mol
          </span>
          <span className="text-slate-500">÷</span>
          <span className="text-emerald-300">
            溶液 <strong className="text-base">{calc.solutionVolumeL.toFixed(3)}</strong> L
          </span>
          <span className="text-slate-500">＝</span>
          <span className="text-purple-300">
            モル濃度 <strong className="text-base">{calc.formattedConcentration}</strong> mol/L
          </span>
          <span className="font-sans text-[10px] text-slate-500 w-full text-center">（1L あたり {calc.formattedConcentration} パック）</span>
        </div>

        {/* 質量・密度（単元④：質量パーセント濃度とモル濃度をつなぐ） */}
        {showMassAndDensity && (
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:text-xs font-mono text-slate-300">
            <span className="font-sans text-slate-400">⚖️ 質量で見ると：</span>
            <span>
              溶液の質量 <strong className="text-white">{massInfo.solutionMassG}</strong> g
            </span>
            <span>
              密度 <strong className="text-white">{massInfo.densityGPerML.toFixed(3)}</strong> g/mL
            </span>
            <span>
              質量％濃度 <strong className="text-white">{massInfo.massPercent.toFixed(1)}</strong> %
            </span>
            <span className="font-sans text-[10px] text-slate-500 w-full text-center">
              溶質 {massInfo.soluteMassG}g ÷ 溶液 {massInfo.solutionMassG}g × 100 ／ 密度 ＝ 溶液の質量 ÷ 体積（水 1mL ＝ 1g として計算）
            </span>
          </div>
        )}

        {!readOnly && isFull && (
          <p className="text-center text-[11px] font-semibold text-rose-300">容器がいっぱいです（{FLASK_CAPACITY_ML}mL まで）</p>
        )}
        <p className="text-[10px] text-slate-400 leading-relaxed">
          ※ 本物のメスフラスコは標線が1本だけで、100mL用・500mL用・1L用のように容器を使い分けます。ここでは1つの容器に標線をまとめています。
        </p>
      </div>
    </div>
  );
};

// ---------- 部品 ----------

const GroupLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[11px] font-semibold text-slate-300 mt-1 first:mt-0">{children}</span>
);

const DECK_TONES = {
  slate: ['text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-600', 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-600'],
  amber: ['text-amber-950 bg-amber-200 hover:bg-amber-100 border-amber-100', 'text-amber-950 bg-amber-300 hover:bg-amber-200 border-amber-200'],
  sky: ['text-sky-950 bg-sky-200 hover:bg-sky-100 border-sky-100', 'text-sky-950 bg-sky-300 hover:bg-sky-200 border-sky-200'],
  emerald: ['text-emerald-950 bg-emerald-200 hover:bg-emerald-100 border-emerald-100', 'text-white bg-emerald-600 hover:bg-emerald-500 border-emerald-400'],
} as const;

const DeckButton: React.FC<{ label: string; tone?: keyof typeof DECK_TONES; strong?: boolean; disabled?: boolean; onClick: () => void }> = ({
  label,
  tone = 'slate',
  strong,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`py-1.5 text-[11px] sm:text-xs font-bold rounded-lg border transition-colors disabled:opacity-40 ${DECK_TONES[tone][strong ? 1 : 0]}`}
  >
    {label}
  </button>
);
