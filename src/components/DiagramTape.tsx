import React from 'react';
import { UnitId } from '../types';
import { SUBSTANCES } from '../data/cards';
import { calculateMassPercent, calculateMolesToQuantities, calculateMolarConcentration } from '../utils/chemistry';

interface DiagramTapeProps {
  unitId: UnitId;
  state: {
    soluteG?: number;
    waterG?: number;
    substanceId?: string;
    packs?: number;
    flaskWaterML?: number;
    flaskPacks?: number;
    flaskSubstanceId?: string;
  };
}

export const DiagramTape: React.FC<DiagramTapeProps> = ({ unitId, state }) => {
  if (unitId === 'unit1') {
    const soluteG = state.soluteG ?? 10;
    const waterG = state.waterG ?? 90;
    const calc = calculateMassPercent(soluteG, waterG);
    const solutePct = calc.solutionG > 0 ? (calc.soluteG / calc.solutionG) * 100 : 0;
    const waterPct = 100 - solutePct;

    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>図（帯グラフ・線分図）：溶液全体に対する溶質の割合</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            溶液全体（食塩＋水）の長さの中で、食塩がどれだけの割合を占めているかを視覚化しています。
          </p>
        </div>

        {/* 1. Actual Composition Tape */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">実際の質量（重さ）の帯</span>
            <span className="text-emerald-700 font-bold font-mono">
              溶液全体: {calc.solutionG}g
            </span>
          </div>

          <div className="h-12 w-full rounded-xl overflow-hidden flex border-2 border-slate-300 shadow-inner">
            {calc.soluteG > 0 && (
              <div
                className="h-full bg-orange-500 flex flex-col items-center justify-center text-white text-xs font-bold transition-all relative group"
                style={{ width: `${Math.max(8, solutePct)}%` }}
                title={`溶質: ${calc.soluteG}g`}
              >
                <span className="truncate px-1">溶質 {calc.soluteG}g</span>
                <span className="text-[10px] font-normal opacity-90">({calc.formattedPercent}%)</span>
              </div>
            )}
            {calc.waterG > 0 && (
              <div
                className="h-full bg-sky-400 flex flex-col items-center justify-center text-slate-900 text-xs font-bold transition-all"
                style={{ width: `${calc.soluteG > 0 ? waterPct : 100}%` }}
                title={`水: ${calc.waterG}g`}
              >
                <span className="truncate px-1">水 {calc.waterG}g</span>
                <span className="text-[10px] font-normal text-slate-700">({(100 - calc.percent).toFixed(1)}%)</span>
              </div>
            )}
            {calc.solutionG === 0 && (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                空（0g）
              </div>
            )}
          </div>

          {/* Bracket Indicator for Whole Solution */}
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-emerald-700 font-medium">
            <div className="h-0.5 flex-1 bg-emerald-400"></div>
            <span>溶液全体 ＝ 溶質（{calc.soluteG}g）＋ 水（{calc.waterG}g）＝ {calc.solutionG}g</span>
            <div className="h-0.5 flex-1 bg-emerald-400"></div>
          </div>
        </div>

        {/* 2. 100g Benchmark Representation (What % means) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-purple-900">
              「質量パーセント濃度（%）」の意味：溶液が 100g あったら？
            </span>
            <span className="font-mono font-bold text-purple-700 text-sm">
              {calc.formattedPercent}%
            </span>
          </div>

          <div className="h-8 w-full bg-slate-200 rounded-lg overflow-hidden flex border border-slate-300">
            <div
              className="h-full bg-purple-600 flex items-center justify-center text-white text-[11px] font-bold transition-all"
              style={{ width: `${Math.min(100, Math.max(4, calc.percent))}%` }}
            >
              {calc.percent > 5 && `溶質 ${calc.formattedPercent}g`}
            </div>
            <div className="flex-1 flex items-center justify-center text-slate-600 text-[11px]">
              水 {(100 - calc.percent).toFixed(1)}g
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            ※ 質量パーセント濃度とは、<strong>「溶液全体がもし100gあったら、そのうち食塩が何g入っているか」</strong>を表す割合です。
          </p>
        </div>
      </div>
    );
  }

  if (unitId === 'unit2') {
    const substanceId = state.substanceId || 'NaCl';
    const packs = state.packs ?? 1.0;
    const substance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
    const q = calculateMolesToQuantities(packs, substanceId);
    const theme = substance.theme;

    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="text-base">{substance.icon}</span>
            <span>図（数直線・比率図）：パック数（mol）と重さ（g）の関係</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            1パック（1.0mol）の重さ（モル質量）を基準に、現在のパック数と重さの比例関係を示しています。
          </p>
        </div>

        {/* Number line comparing moles to grams themed to the substance */}
        <div
          className="p-4 rounded-xl border flex flex-col gap-3 transition-colors"
          style={{
            backgroundColor: `${theme.accent}0d`,
            borderColor: `${theme.accent}40`,
          }}
        >
          <div className="text-xs font-semibold flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-900 font-bold">
              <span>{substance.icon}</span>
              <span>{substance.name} ({substance.formula})</span>
            </span>
            <span
              className="font-mono text-xs px-2 py-0.5 rounded-md font-bold"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              1パックの基準重さ ＝ {substance.molarMass} g/mol
            </span>
          </div>

          {/* Visual Bar of Mol Scale */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0 mol (0g)</span>
              <span>1 mol ({substance.molarMass}g)</span>
              <span>2 mol ({substance.molarMass * 2}g)</span>
              <span>3 mol ({substance.molarMass * 3}g)</span>
            </div>

            <div className="relative h-6 w-full bg-slate-200 rounded-lg overflow-hidden flex border border-slate-300">
              <div
                className={`h-full ${theme.activeSlot} transition-all rounded-l-lg flex items-center justify-end pr-2 text-white font-mono text-xs font-bold shadow-xs`}
                style={{ width: `${Math.min(100, (q.packs / 3) * 100)}%` }}
              >
                {q.packs > 0.2 && `${q.packs} mol`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-md font-bold text-xs"
                style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
              >
                パック数
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">{q.packs} mol</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold text-xs">
                重さ
              </span>
              <span className="font-mono font-bold text-emerald-700 text-sm">{q.massG} g</span>
            </div>
          </div>
        </div>

        {/* 10-slot Sub-division Visualizer */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">
            1パック（1mol）を10個に小分けした表示（小分け1個 ＝ 0.1mol）:
          </span>
          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-100 rounded-xl border border-slate-200">
            {Array.from({ length: 30 }).map((_, idx) => {
              const active = idx < Math.floor(q.pieces + 1e-9);
              const partial = !active && idx < q.pieces; // 0.1mol 未満の端数
              return (
                <div
                  key={`tape-piece-${idx}`}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    active
                      ? `${theme.activeSlot} text-white shadow-xs scale-105`
                      : partial
                      ? `${theme.activeSlot} text-white opacity-50 border border-dashed border-slate-400`
                      : 'bg-white text-slate-300 border border-slate-200'
                  }`}
                  title={`小分け ${(idx * 0.1).toFixed(1)} mol`}
                >
                  {active || partial ? (
                    <span className="text-[11px]">{substance.icon}</span>
                  ) : (
                    <span className="text-[9px] text-slate-300">○</span>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-[11px] text-slate-500">
            現在 小分け <strong>{q.pieces}個分</strong> 点灯 ＝ <strong>{q.packs} mol</strong>
          </span>
        </div>
      </div>
    );
  }

  // Unit 3 & Comprehensive
  const flaskPacks = state.flaskPacks ?? state.packs ?? 0.1;
  const flaskWaterML = state.flaskWaterML ?? 900;
  const substanceId = state.flaskSubstanceId || state.substanceId || 'NaCl';
  const substance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  const calc = calculateMolarConcentration(flaskPacks, flaskWaterML, substanceId);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
          <span>図（1L換算図）：溶液1Lの中にパックがいくつあるか</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          モル濃度は「溶液1L（1000mL）あたり何パック（mol）あるか」という割合（混み具合）です。
        </p>
      </div>

      {/* Comparison: Current Volume vs 1L Standard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Actual Solution */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-col gap-2">
          <span className="text-xs font-semibold text-emerald-900">
            現在の容器内の状態
          </span>
          <div className="h-16 bg-white rounded-lg border border-emerald-300 p-2 flex flex-col justify-between">
            <div className="flex justify-between text-xs text-slate-600">
              <span>体積: <strong className="font-mono text-emerald-700">{calc.solutionVolumeML} mL</strong></span>
              <span>パック数: <strong className="font-mono text-amber-600">{calc.packs} mol</strong></span>
            </div>
            <div className="flex gap-1 overflow-hidden">
              {Array.from({ length: Math.min(8, Math.ceil(calc.packs * 5)) }).map((_, i) => (
                <span key={i} className="text-xs">{substance.icon}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 1L Normalized View */}
        <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/80 flex flex-col gap-2">
          <span className="text-xs font-semibold text-purple-900">
            1L（1000mL）に換算したモル濃度
          </span>
          <div className="h-16 bg-white rounded-lg border border-purple-300 p-2 flex flex-col justify-between">
            <div className="flex justify-between text-xs text-slate-600">
              <span>基準体積: <strong>1.0 L (1000mL)</strong></span>
              <span>モル濃度: <strong className="font-mono text-purple-700 text-sm">{calc.formattedConcentration} mol/L</strong></span>
            </div>
            <span className="text-[11px] text-purple-800 font-medium">
              1L あたりに {calc.formattedConcentration} パック詰まっている濃さ
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
        💡 <strong>ポイント：</strong> 水を足して体積を大きくすると、パックが広い空間に散らばるのでモル濃度は下がります。
        逆に一部を取り出しても（くみ出し）、1Lあたりの混み具合は変わらないためモル濃度は同じです。
      </div>
    </div>
  );
};
