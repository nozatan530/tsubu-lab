import React, { useMemo } from 'react';
import { calculateMassPercent } from '../utils/chemistry';
import { Plus, Split, Combine, RotateCcw } from 'lucide-react';

interface ParticleBeakerProps {
  soluteG: number;
  waterG: number;
  secondBeaker?: { soluteG: number; waterG: number };
  onUpdate: (updates: {
    soluteG: number;
    waterG: number;
    secondBeaker?: { soluteG: number; waterG: number };
    actionDescription?: string;
  }) => void;
  readOnly?: boolean;
}

// ビーカーの目盛り（最大 300g）。液面の高さと同じ基準で位置を決める
const BEAKER_MAX_G = 300;
const liquidHeightPct = (solutionG: number) =>
  solutionG <= 0 ? 6 : Math.min(100, Math.max(2, (solutionG / BEAKER_MAX_G) * 100));

const BeakerTicks: React.FC = () => (
  <div className="absolute inset-2 select-none pointer-events-none z-10">
    {[50, 100, 150, 200, 250, 300].map((g) => (
      <div
        key={g}
        className="absolute left-0 flex items-center gap-0.5 translate-y-1/2"
        style={{ bottom: `${(g / BEAKER_MAX_G) * 100}%` }}
      >
        <div className="w-2 h-px bg-slate-400/70" />
        <span className="text-[9px] font-mono text-slate-400">{g}g</span>
      </div>
    ))}
  </div>
);

export const ParticleBeaker: React.FC<ParticleBeakerProps> = ({
  soluteG,
  waterG,
  secondBeaker,
  onUpdate,
  readOnly = false,
}) => {
  const calcA = calculateMassPercent(soluteG, waterG);
  const calcB = secondBeaker ? calculateMassPercent(secondBeaker.soluteG, secondBeaker.waterG) : null;
  const hasSecond = secondBeaker && secondBeaker.waterG + secondBeaker.soluteG > 0;
  // 同じ濃度なら「くみ出した分」、違えば別の食塩水として扱う（混ぜる前の2つの液など）
  const isSameConcentration = !!calcB && Math.abs(calcA.percent - calcB.percent) < 0.05;

  // Generate deterministic particle coordinates inside the liquid area for Beaker A
  const particlesA = useMemo(() => {
    const list = [];
    const count = Math.min(50, Math.round(soluteG));
    // Seeded distribution based on index
    for (let i = 0; i < count; i++) {
      const u = (Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
      const v = (Math.cos(i * 4.898 + 12.233) * 23421.631) % 1;
      const xPct = 12 + Math.abs(u) * 76; // 12% to 88% width
      const yPct = 15 + Math.abs(v) * 75; // 15% to 90% depth of liquid
      list.push({ id: `pA-${i}`, xPct, yPct });
    }
    return list;
  }, [soluteG]);

  // Generate deterministic particle coordinates for Beaker B
  const particlesB = useMemo(() => {
    if (!secondBeaker) return [];
    const list = [];
    const count = Math.min(50, Math.round(secondBeaker.soluteG));
    for (let i = 0; i < count; i++) {
      const u = (Math.sin(i * 37.9898 + 19.233) * 43758.5453) % 1;
      const v = (Math.cos(i * 14.898 + 43.233) * 23421.631) % 1;
      const xPct = 12 + Math.abs(u) * 76;
      const yPct = 15 + Math.abs(v) * 75;
      list.push({ id: `pB-${i}`, xPct, yPct });
    }
    return list;
  }, [secondBeaker]);

  // Operations
  const handleAddSolute = (amount: number) => {
    if (readOnly) return;
    const nextSolute = Math.min(50, soluteG + amount);
    onUpdate({
      soluteG: nextSolute,
      waterG,
      secondBeaker,
      actionDescription: `溶質（食塩）+${amount}g`,
    });
  };

  const handleAddWater = (amount: number) => {
    if (readOnly) return;
    const nextWater = Math.min(260, waterG + amount);
    onUpdate({
      soluteG,
      waterG: nextWater,
      secondBeaker,
      actionDescription: `水 +${amount}g`,
    });
  };

  const handleSplit = (fraction: number) => {
    if (readOnly) return;
    // 丸めずに同じ割合で分ける（整数に丸めると2つのビーカーの濃度がずれる）
    const splitSolute = soluteG * fraction;
    const splitWater = waterG * fraction;

    const remainingSolute = soluteG - splitSolute;
    const remainingWater = waterG - splitWater;

    const currentSecondSolute = secondBeaker?.soluteG || 0;
    const currentSecondWater = secondBeaker?.waterG || 0;

    onUpdate({
      soluteG: remainingSolute,
      waterG: remainingWater,
      secondBeaker: {
        soluteG: currentSecondSolute + splitSolute,
        waterG: currentSecondWater + splitWater,
      },
      actionDescription: fraction === 0.5 ? '半分くみ出す' : '1/4くみ出す',
    });
  };

  const handleMerge = () => {
    if (readOnly || !secondBeaker) return;
    onUpdate({
      soluteG: soluteG + secondBeaker.soluteG,
      waterG: waterG + secondBeaker.waterG,
      secondBeaker: undefined,
      actionDescription: '2つのビーカーを混ぜる',
    });
  };

  const handleReset = () => {
    if (readOnly) return;
    onUpdate({
      soluteG: 10,
      waterG: 90,
      secondBeaker: undefined,
      actionDescription: '初期状態（10% 100g）にリセット',
    });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Visual Simulation Beakers */}
      <div className="w-full bg-linear-to-b from-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
        {/* Lab background grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
          {/* Beaker A */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              {hasSecond ? 'ビーカー A' : 'メインビーカー'}
            </span>
            <div className="relative w-44 h-56 sm:w-48 sm:h-60 bg-slate-900/60 rounded-b-2xl border-x-4 border-b-4 border-slate-400/40 shadow-inner flex flex-col justify-end p-2 overflow-hidden">
              {/* Spout detail at top left */}
              <div className="absolute top-0 -left-1 w-3 h-3 border-t-4 border-l-4 border-slate-400/40 rounded-tl-sm -rotate-45" />

              {/* Volume tick marks on beaker */}
              <BeakerTicks />

              {/* Water Liquid Area */}
              <div
                className="w-full bg-linear-to-b from-sky-400/70 to-sky-600/80 rounded-b-xl relative transition-all duration-300 ease-out overflow-hidden"
                style={{
                  height: `${liquidHeightPct(calcA.solutionG)}%`,
                }}
              >
                {/* Surface Meniscus highlight */}
                <div className="absolute top-0 inset-x-0 h-2 bg-sky-200/50 blur-[1px]" />

                {/* Orange Solute Markers (●1個 = 食塩1g) */}
                {particlesA.map((p) => (
                  <div
                    key={p.id}
                    className="absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full bg-radial from-orange-400 to-amber-600 shadow-sm border border-orange-200/80 transition-all duration-200"
                    style={{
                      left: `${p.xPct}%`,
                      top: `${p.yPct}%`,
                    }}
                    title="食塩 1g ぶんの目印"
                  />
                ))}

                {/* Empty liquid indicator if 0g */}
                {calcA.solutionG === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-sky-200/60 font-sans">
                    空（から）
                  </div>
                )}
              </div>
            </div>

            {/* Readout chip for Beaker A */}
            <div className="mt-2.5 px-3 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-center">
              <div className="text-[11px] text-slate-400 font-sans">
                溶質 <span className="font-bold text-orange-400">{calcA.soluteG}g</span> · 水 <span className="font-bold text-sky-300">{calcA.waterG}g</span>
              </div>
              <div className="text-sm font-bold font-mono text-purple-300 mt-0.5">
                {calcA.solutionG > 0 ? `${calcA.formattedPercent}%` : '0%'}
                <span className="text-[10px] font-normal text-slate-400 ml-1">（{calcA.solutionG}g）</span>
              </div>
            </div>
          </div>

          {/* Divider Arrow / Split indicator when Beaker B exists */}
          {hasSecond && (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
              <Split className="w-5 h-5 text-amber-400 rotate-90 md:rotate-0" />
              <span className="text-[11px] font-sans text-amber-200">{isSameConcentration ? '分けた' : '別の液'}</span>
            </div>
          )}

          {/* Beaker B (Divided Beaker) */}
          {hasSecond && (
            <div className="flex flex-col items-center animate-fade-in">
              <span className="text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                {isSameConcentration ? 'ビーカー B（くみ出した分）' : 'ビーカー B'}
              </span>
              <div className="relative w-44 h-56 sm:w-48 sm:h-60 bg-slate-900/60 rounded-b-2xl border-x-4 border-b-4 border-amber-400/40 shadow-inner flex flex-col justify-end p-2 overflow-hidden">
                <BeakerTicks />

                <div
                  className="w-full bg-linear-to-b from-sky-400/70 to-sky-600/80 rounded-b-xl relative transition-all duration-300 ease-out overflow-hidden"
                  style={{
                    height: `${liquidHeightPct(calcB!.solutionG)}%`,
                  }}
                >
                  <div className="absolute top-0 inset-x-0 h-2 bg-sky-200/50 blur-[1px]" />

                  {/* Orange Solute Particles in Beaker B */}
                  {particlesB.map((p) => (
                    <div
                      key={p.id}
                      className="absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full bg-radial from-orange-400 to-amber-600 shadow-sm border border-orange-200/80 transition-all duration-200"
                      style={{
                        left: `${p.xPct}%`,
                        top: `${p.yPct}%`,
                      }}
                      title="食塩 1g ぶんの目印"
                    />
                  ))}
                </div>
              </div>

              {/* Readout chip for Beaker B */}
              <div className="mt-2.5 px-3 py-1 rounded-lg bg-slate-800/90 border border-amber-600/40 text-center">
                <div className="text-[11px] text-slate-400 font-sans">
                  溶質 <span className="font-bold text-orange-400">{calcB!.soluteG}g</span> · 水 <span className="font-bold text-sky-300">{calcB!.waterG}g</span>
                </div>
                <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
                  {calcB!.solutionG > 0 ? `${calcB!.formattedPercent}%` : '0%'}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">（{calcB!.solutionG}g）</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 単元②の「1粒は軽すぎて測れない」と矛盾しないよう、●が何を表すかを明示する */}
        <p className="relative z-10 mt-3 text-[11px] text-slate-400 text-center leading-relaxed">
          ※ オレンジの●1個は<strong className="text-orange-300">「食塩 1g ぶん」の目印</strong>です。
          本物の粒（Na⁺ と Cl⁻）は小さすぎて見えず、食塩 1g の中にも約 1×10²² 組も入っています。
        </p>

        {/* Crowding insight banner when partitioned */}
        {hasSecond && (
          <div className="mt-4 p-2.5 bg-amber-950/60 border border-amber-500/30 rounded-xl text-center text-xs text-amber-200 font-medium">
            {isSameConcentration ? (
              <>
                💡 注目！ ビーカーAもBも、粒同士の距離（混み具合）は同じ＝どちらも濃度は <strong className="font-mono text-white underline">{calcA.formattedPercent}%</strong> のまま変わりません！
              </>
            ) : (
              <>
                💡 ビーカーA（<strong className="font-mono text-white">{calcA.formattedPercent}%</strong>）とビーカーB（<strong className="font-mono text-white">{calcB!.formattedPercent}%</strong>）は濃さが違います。混ぜると粒の混み具合はどうなるかな？
              </>
            )}
          </div>
        )}
      </div>

      {/* Lab Scale / Balance Readout Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="text-base">⚖️</span> 天秤の表示（メインビーカー）
          </span>
          <span className="text-[11px] text-slate-400">分母は「溶液全体」</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-lg p-2.5">
            <span className="text-[11px] font-medium text-orange-700 block">溶質（食塩）</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-orange-600 tabular-nums">
              {calcA.soluteG}
              <span className="text-xs font-normal ml-0.5 text-orange-700">g</span>
            </span>
          </div>

          <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-2.5">
            <span className="text-[11px] font-medium text-sky-700 block">溶媒（水）</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-sky-600 tabular-nums">
              {calcA.waterG}
              <span className="text-xs font-normal ml-0.5 text-sky-700">g</span>
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5">
            <span className="text-[11px] font-medium text-emerald-800 block">溶液全体（合計）</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-700 tabular-nums">
              {calcA.solutionG}
              <span className="text-xs font-normal ml-0.5 text-emerald-800">g</span>
            </span>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/80 rounded-lg p-2.5">
            <span className="text-[11px] font-medium text-purple-700 block">質量パーセント濃度</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-purple-700 tabular-nums">
              {calcA.formattedPercent}
              <span className="text-xs font-normal ml-0.5 text-purple-700">%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      {!readOnly && (
        <div className="bg-slate-100/80 p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-col gap-2.5">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>操作パネル</span>
            <span className="text-[11px] font-normal text-slate-500">ボタンをタップして調整</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Add Solute */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-orange-700">食塩を足す（●）</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleAddSolute(1)}
                  disabled={soluteG >= 50}
                  className="flex-1 py-2 text-xs font-bold text-orange-800 bg-orange-100 hover:bg-orange-200 active:bg-orange-300 rounded-lg transition-colors border border-orange-300/80 disabled:opacity-50"
                >
                  +1g
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSolute(5)}
                  disabled={soluteG >= 50}
                  className="flex-1 py-2 text-xs font-bold text-orange-900 bg-orange-200 hover:bg-orange-300 active:bg-orange-400 rounded-lg transition-colors border border-orange-300 disabled:opacity-50"
                >
                  +5g
                </button>
              </div>
            </div>

            {/* Add Water */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-sky-700">水を足す（液面）</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleAddWater(10)}
                  disabled={calcA.solutionG >= 300}
                  className="flex-1 py-2 text-xs font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 active:bg-sky-300 rounded-lg transition-colors border border-sky-300/80 disabled:opacity-50"
                >
                  +10g
                </button>
                <button
                  type="button"
                  onClick={() => handleAddWater(50)}
                  disabled={calcA.solutionG >= 300}
                  className="flex-1 py-2 text-xs font-bold text-sky-900 bg-sky-200 hover:bg-sky-300 active:bg-sky-400 rounded-lg transition-colors border border-sky-300 disabled:opacity-50"
                >
                  +50g
                </button>
              </div>
            </div>

            {/* Split Beaker */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-amber-700">溶液をくみ出す</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleSplit(0.5)}
                  disabled={calcA.solutionG < 4}
                  className="flex-1 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 rounded-lg transition-colors border border-amber-300/80 disabled:opacity-50"
                >
                  半分
                </button>
                <button
                  type="button"
                  onClick={() => handleSplit(0.25)}
                  disabled={calcA.solutionG < 8}
                  className="flex-1 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 rounded-lg transition-colors border border-amber-300/80 disabled:opacity-50"
                >
                  1/4
                </button>
              </div>
            </div>

            {/* Merge or Reset */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-600">整理</span>
              <div className="flex gap-1">
                {hasSecond ? (
                  <button
                    type="button"
                    onClick={handleMerge}
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1"
                  >
                    <Combine className="w-3.5 h-3.5" />
                    混ぜる
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-200/80 active:bg-slate-300 rounded-lg transition-colors border border-slate-300 flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    初期化
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
