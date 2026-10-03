import React from 'react';
import { UnitId } from '../types';
import { SUBSTANCES } from '../data/cards';
import { calculateMassPercent, calculateMolesToQuantities, calculateMolarConcentration, calculateSolutionMass } from '../utils/chemistry';

interface FormulaDisplayProps {
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

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ unitId, state }) => {
  if (unitId === 'unit1') {
    const soluteG = state.soluteG ?? 10;
    const waterG = state.waterG ?? 90;
    const calc = calculateMassPercent(soluteG, waterG);

    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>式（公式と計算）：数字と色の対応</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            式の数字は、ビーカー内の「粒」や「液面」の量と直接対応しています。
          </p>
        </div>

        {/* Big colorful formula card */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col items-center gap-4">
          <span className="text-xs font-semibold text-slate-400">
            質量パーセント濃度（%）の計算式
          </span>

          {/* Mathematical Fraction Representation */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-mono font-bold">
              {/* Fraction */}
              <div className="flex flex-col items-center">
                <span className="text-orange-400 border-b-2 border-slate-500 pb-1 px-3">
                  {calc.soluteG}g <span className="text-xs font-sans text-orange-200">（溶質）</span>
                </span>
                <span className="text-emerald-400 pt-1 px-3">
                  {calc.solutionG}g <span className="text-xs font-sans text-emerald-200">（溶液全体）</span>
                </span>
              </div>

              <span className="text-slate-400">×</span>
              <span className="text-slate-200">100</span>
              <span className="text-slate-400">＝</span>
              <span className="text-purple-300 bg-purple-950/80 px-3 py-1 rounded-xl border border-purple-500/40">
                {calc.formattedPercent} %
              </span>
            </div>

            {/* Break down of the denominator */}
            <div className="text-xs font-mono text-slate-400 mt-1">
              分母の <span className="text-emerald-400 font-bold">{calc.solutionG}g</span> ＝
              食塩 <span className="text-orange-400 font-bold">{calc.soluteG}g</span> ＋
              水 <span className="text-sky-300 font-bold">{calc.waterG}g</span>
            </div>
          </div>
        </div>

        {/* Plain language explanation of ÷ and × */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl">
            <span className="font-bold text-orange-900 block mb-1">
              「÷（割る）」の意味
            </span>
            <p className="text-orange-800 leading-relaxed text-[11px]">
              食塩の重さを<strong>溶液全体の重さ</strong>で割ることで、<strong>「溶液1gあたりに食塩が何gあるか」</strong>（1gあたりの割合）を求めています。
            </p>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl">
            <span className="font-bold text-purple-900 block mb-1">
              「× 100」の意味
            </span>
            <p className="text-purple-800 leading-relaxed text-[11px]">
              求めた割合に100を掛けることで、<strong>「溶液が100gあったら何gか（＝パーセント %）」</strong>という身近な比率に直しています。
            </p>
          </div>
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
            <span>式（公式と計算）：{substance.name} ({substance.formula}) の物質量と質量の変換</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            買い物の計算（1個の値段 × 個数 ＝ 代金）と同じルールで、モル質量とモルを掛け算します。
          </p>
        </div>

        {/* Big colorful formula card */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col items-center gap-4">
          <span className="text-xs font-semibold text-slate-400">
            物質量（mol）から質量（g）を求める計算
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-lg sm:text-2xl font-mono font-bold">
            {/* Molar mass */}
            <span
              className="px-2.5 py-1 rounded-lg border font-mono"
              style={{
                backgroundColor: `${theme.accent}33`,
                borderColor: `${theme.accent}80`,
                color: '#ffffff',
              }}
            >
              {q.molarMass} <span className="text-xs font-sans opacity-80">g/mol</span>
            </span>

            <span className="text-slate-400">×</span>

            {/* Moles (Packs) */}
            <span
              className="px-2.5 py-1 rounded-lg border font-mono"
              style={{
                backgroundColor: `${theme.accent}22`,
                borderColor: `${theme.accent}60`,
                color: '#ffffff',
              }}
            >
              {q.packs} <span className="text-xs font-sans opacity-80">mol</span>
            </span>

            <span className="text-slate-400">＝</span>

            {/* Mass */}
            <span className="text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/40">
              {q.massG} g
            </span>
          </div>

          <div className="text-xs text-slate-400">
            【言葉で書くと】 <strong className="text-white">モル質量（1パックの重さ: {q.molarMass}g）</strong> × <strong className="text-white">物質量（パック数: {q.packs}mol）</strong> ＝ <strong className="text-emerald-300">全体の重さ（{q.massG}g）</strong>
          </div>
        </div>

        {/* Inverse Formula (Mass to Moles) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">
            逆に、重さ（g）からパック数（mol）を求めるときは？
          </span>
          <div className="text-sm font-mono font-bold text-slate-800">
            <span className="text-emerald-700">{q.massG} g</span> ÷ <span className="text-amber-700">{q.molarMass} g/mol</span> ＝ <span className="text-amber-600">{q.packs} mol</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            全体の重さを「1パックの重さ」で割ることで、中に何パック入っているか（物質量）が求まります。
          </p>
        </div>
      </div>
    );
  }

  // Unit 3 & Comprehensive
  const flaskPacks = state.flaskPacks ?? state.packs ?? 0.1;
  const flaskWaterML = state.flaskWaterML ?? 900;
  const substanceId = state.flaskSubstanceId || state.substanceId || 'NaCl';
  const calc = calculateMolarConcentration(flaskPacks, flaskWaterML, substanceId);
  const substance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  const massInfo = calculateSolutionMass(flaskPacks, flaskWaterML, substanceId);
  // 密度を使った換算（1L あたりで考える）。現在の容器の値から計算するので、上のモル濃度と一致する
  const massPer1L = 1000 * massInfo.densityGPerML;
  const solutePer1L = massPer1L * (massInfo.massPercent / 100);
  const molPer1L = solutePer1L / substance.molarMass;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
          <span>式（公式と計算）：モル濃度（mol/L）の計算</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          モル濃度は、溶質のパック数（mol）を、<strong>溶液全体の体積（L）</strong>で割って求めます。
        </p>
      </div>

      {/* Big colorful formula card */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col items-center gap-4">
        <span className="text-xs font-semibold text-slate-400">
          モル濃度（mol/L）の計算式
        </span>

        {/* Fraction */}
        <div className="flex items-center gap-3 text-lg sm:text-2xl font-mono font-bold">
          <div className="flex flex-col items-center">
            <span className="text-amber-300 border-b-2 border-slate-500 pb-1 px-3">
              {calc.packs} mol <span className="text-xs font-sans text-amber-200">（パック数）</span>
            </span>
            <span className="text-emerald-400 pt-1 px-3">
              {calc.solutionVolumeL.toFixed(3)} L <span className="text-xs font-sans text-emerald-200">（溶液の体積）</span>
            </span>
          </div>

          <span className="text-slate-400">＝</span>

          <span className="text-purple-300 bg-purple-950/80 px-3 py-1 rounded-xl border border-purple-500/40">
            {calc.formattedConcentration} mol/L
          </span>
        </div>

        <div className="text-xs text-slate-400">
          体積 mL を 1000 で割って L（リットル）に直してから割ります（{calc.solutionVolumeML}mL ÷ 1000 ＝ {calc.solutionVolumeL.toFixed(3)}L）
        </div>
      </div>

      {unitId === 'comprehensive' && calc.solutionVolumeML > 0 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">
            質量パーセント濃度（{massInfo.massPercent.toFixed(1)}%）→ モル濃度：密度（{massInfo.densityGPerML.toFixed(3)} g/mL）で「1Lは何gか」に直す
          </span>
          <ol className="text-xs sm:text-sm font-mono text-slate-800 space-y-1 list-none">
            <li>① 溶液1Lの質量 ＝ 1000 mL × {massInfo.densityGPerML.toFixed(3)} g/mL ＝ <strong>{massPer1L.toFixed(1)} g</strong></li>
            <li>② その中の溶質 ＝ {massPer1L.toFixed(1)} g × {(massInfo.massPercent / 100).toFixed(3)} ＝ <strong>{solutePer1L.toFixed(1)} g</strong></li>
            <li>③ パック数 ＝ {solutePer1L.toFixed(1)} g ÷ {substance.molarMass} g/mol ＝ <strong className="text-purple-700">{molPer1L.toFixed(2)} mol</strong> → {molPer1L.toFixed(2)} mol/L</li>
          </ol>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            質量パーセント濃度は「質量（g）あたり」、モル濃度は「体積（L）あたり」。物差しが違うので、密度（溶液1mLあたりの質量）で体積を質量に直してからつなぎます。
          </p>
        </div>
      )}

      <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs text-purple-900 leading-relaxed">
        <strong>「モル濃度」という名前の言い換え：</strong>
        <p className="text-[11px] text-purple-800 mt-1">
          教科書では難しそうに見えますが、意味はシンプルに<strong>「溶液1Lあたり何パック溶けているか」</strong>という混み具合（濃さ）のことです。
        </p>
      </div>
    </div>
  );
};
