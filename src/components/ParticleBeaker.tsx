import React, { useMemo } from 'react';
import { calculateMassPercent } from '../utils/chemistry';
import {
  BeakerState,
  BEAKER_INITIAL,
  beakerRoom,
  beakerAddSolute,
  beakerAddWater,
  beakerMerge,
  beakerSplit,
} from '../utils/operations';
import { Combine, RotateCcw, ArrowRight } from 'lucide-react';

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
  const state: BeakerState = { soluteG, waterG, secondBeaker };
  const room = beakerRoom(state);

  const handleAddSolute = (amount: number) => {
    if (readOnly) return;
    onUpdate({ ...beakerAddSolute(state, amount), actionDescription: `溶質（食塩）+${amount}g` });
  };

  const handleAddWater = (amount: number) => {
    if (readOnly) return;
    onUpdate({ ...beakerAddWater(state, amount), actionDescription: `水 +${amount}g` });
  };

  const handleSplit = (fraction: number) => {
    if (readOnly) return;
    onUpdate({
      ...beakerSplit(state, fraction),
      actionDescription: fraction === 0.5 ? '半分くみ出す' : '1/4くみ出す',
    });
  };

  const handleMerge = () => {
    if (readOnly || !secondBeaker) return;
    onUpdate({ ...beakerMerge(state), actionDescription: '2つのビーカーを混ぜる' });
  };

  const handleReset = () => {
    if (readOnly) return;
    onUpdate({ ...BEAKER_INITIAL, actionDescription: '初期状態（10% 100g）にリセット' });
  };

  const solutionPercentLabel = (c: { solutionG: number; formattedPercent: string }) =>
    c.solutionG > 0 ? `${c.formattedPercent}%` : '0%';

  return (
    <div className="w-full bg-linear-to-b from-slate-900 to-slate-950 p-3 sm:p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
      {/* Lab background grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row gap-3 sm:gap-5">
        {/* 足す操作（PC では左、スマホではビーカーの下） */}
        {!readOnly && (
          <div className="order-2 sm:order-1 grid grid-cols-4 sm:grid-cols-2 sm:w-36 sm:self-center gap-1.5 shrink-0">
            <span className="hidden sm:block col-span-2 text-[11px] font-semibold text-orange-300">食塩を足す（●）</span>
            <PanelButton tone="solute" onClick={() => handleAddSolute(1)} disabled={room.soluteG <= 0} label="+1g" title="食塩を 1g 足す" />
            <PanelButton tone="solute" strong onClick={() => handleAddSolute(5)} disabled={room.soluteG <= 0} label="+5g" title="食塩を 5g 足す" />
            <span className="hidden sm:block col-span-2 mt-1.5 text-[11px] font-semibold text-sky-300">水を足す</span>
            <PanelButton tone="water" onClick={() => handleAddWater(10)} disabled={room.waterG <= 0} label="+10g" title="水を 10g 足す" />
            <PanelButton tone="water" strong onClick={() => handleAddWater(50)} disabled={room.waterG <= 0} label="+50g" title="水を 50g 足す" />
            <span className="sm:hidden col-span-4 -mt-0.5 flex justify-between text-[10px] font-semibold px-1">
              <span className="text-orange-300">← 食塩を足す（●）</span>
              <span className="text-sky-300">水を足す →</span>
            </span>
          </div>
        )}

        {/* ビーカー A ・ 分ける／混ぜる ・ ビーカー B */}
        <div className="order-1 sm:order-2 flex-1 flex items-end justify-center gap-1.5 sm:gap-3">
          <BeakerView
            title={hasSecond ? 'ビーカー A' : 'メインビーカー'}
            dotClass="bg-sky-400"
            borderClass="border-slate-400/40"
            calc={calcA}
            particles={particlesA}
            percentClass="text-purple-300"
            percentLabel={solutionPercentLabel(calcA)}
          />

          <div className="flex flex-col items-center gap-1.5 pb-14 w-16 sm:w-20 shrink-0">
            {hasSecond && (
              <span className="text-[10px] font-semibold text-amber-200 text-center leading-tight">
                {isSameConcentration ? '分けた' : '別の液'}
              </span>
            )}
            {!readOnly && (
              <>
                <MoveButton onClick={() => handleSplit(0.5)} disabled={calcA.solutionG < 4} label="半分" icon="right" title="Aから半分くみ出してBへ" />
                <MoveButton onClick={() => handleSplit(0.25)} disabled={calcA.solutionG < 8} label="1/4" icon="right" title="Aから1/4くみ出してBへ" />
                {hasSecond && <MoveButton onClick={handleMerge} label="混ぜる" icon="merge" title="BをAに戻して混ぜる" emphasized />}
              </>
            )}
          </div>

          {hasSecond ? (
            <BeakerView
              title={isSameConcentration ? 'ビーカー B（くみ出した分）' : 'ビーカー B'}
              dotClass="bg-amber-400"
              borderClass="border-amber-400/40"
              calc={calcB!}
              particles={particlesB}
              percentClass="text-amber-300"
              percentLabel={solutionPercentLabel(calcB!)}
              titleClass="text-amber-300"
            />
          ) : (
            !readOnly && (
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-semibold text-slate-500 mb-1">ビーカー B</span>
                <div className="w-28 h-44 sm:w-36 sm:h-52 rounded-b-2xl border-x-2 border-b-2 border-dashed border-slate-600/70 flex items-center justify-center text-center px-2">
                  <span className="text-[10px] text-slate-500 leading-relaxed">くみ出すと<br />ここに入る</span>
                </div>
                <div className="h-[52px]" />
              </div>
            )
          )}
        </div>
      </div>

      {/* 天秤の表示（メインビーカー／ビーカーA）：食塩 ＋ 水 ＝ 溶液 → 濃度 */}
      <div className="relative z-10 mt-3 p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm font-mono">
        <span className="font-sans text-[11px] text-slate-400 mr-1">⚖️ 天秤（{hasSecond ? 'ビーカーA' : 'メインビーカー'}）</span>
        <span className="text-orange-300">食塩 <strong className="text-base">{calcA.soluteG}</strong>g</span>
        <span className="text-slate-500">＋</span>
        <span className="text-sky-300">水 <strong className="text-base">{calcA.waterG}</strong>g</span>
        <span className="text-slate-500">＝</span>
        <span className="text-emerald-300">溶液 <strong className="text-base">{calcA.solutionG}</strong>g</span>
        <span className="text-slate-500">→</span>
        <span className="text-purple-300">
          濃度 <strong className="text-base">{calcA.formattedPercent}</strong>%
        </span>
        <span className="font-sans text-[10px] text-slate-500 w-full text-center sm:w-auto">（分母は溶液全体）</span>
      </div>

      {/* 状態のメッセージ */}
      {!readOnly && room.waterG <= 0 && (
        <p className="relative z-10 mt-2 text-center text-[11px] font-semibold text-rose-300">
          ビーカーがいっぱいです（A・B 合わせて 300g まで）
        </p>
      )}
      {hasSecond && (
        <div className="relative z-10 mt-2 p-2 bg-amber-950/60 border border-amber-500/30 rounded-xl text-center text-xs text-amber-200 font-medium">
          {isSameConcentration ? (
            <>
              💡 注目！ ビーカーAもBも、粒同士の距離（混み具合）は同じ＝どちらも濃度は{' '}
              <strong className="font-mono text-white underline">{calcA.formattedPercent}%</strong> のまま変わりません！
            </>
          ) : (
            <>
              💡 ビーカーA（<strong className="font-mono text-white">{calcA.formattedPercent}%</strong>）とビーカーB（
              <strong className="font-mono text-white">{calcB!.formattedPercent}%</strong>）は濃さが違います。混ぜると粒の混み具合はどうなるかな？
            </>
          )}
        </div>
      )}

      {/* 単元②の「1粒は軽すぎて測れない」と矛盾しないよう、●が何を表すかを明示する */}
      <div className="relative z-10 mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed flex-1 min-w-0">
          ※ オレンジの●1個は<strong className="text-orange-300">「食塩 1g ぶん」の目印</strong>です。本物の粒（Na⁺ と Cl⁻）は小さすぎて見えず、食塩 1g の中にも約 1×10²² 組も入っています。
        </p>
        {!readOnly && !hasSecond && (
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            初期化（10% 100g）
          </button>
        )}
      </div>
    </div>
  );
};

// ---------- 部品 ----------

interface BeakerViewProps {
  title: string;
  titleClass?: string;
  dotClass: string;
  borderClass: string;
  calc: { soluteG: number; waterG: number; solutionG: number };
  particles: { id: string; xPct: number; yPct: number }[];
  percentClass: string;
  percentLabel: string;
}

const BeakerView: React.FC<BeakerViewProps> = ({ title, titleClass = 'text-slate-300', dotClass, borderClass, calc, particles, percentClass, percentLabel }) => (
  <div className="flex flex-col items-center animate-fade-in">
    <span className={`text-[11px] font-semibold mb-1 flex items-center gap-1 text-center leading-tight ${titleClass}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`}></span>
      {title}
    </span>
    <div className={`relative w-28 h-44 sm:w-36 sm:h-52 bg-slate-900/60 rounded-b-2xl border-x-4 border-b-4 shadow-inner flex flex-col justify-end p-2 overflow-hidden ${borderClass}`}>
      <BeakerTicks />
      <div
        className="w-full bg-linear-to-b from-sky-400/70 to-sky-600/80 rounded-b-xl relative transition-all duration-300 ease-out overflow-hidden"
        style={{ height: `${liquidHeightPct(calc.solutionG)}%` }}
      >
        <div className="absolute top-0 inset-x-0 h-2 bg-sky-200/50 blur-[1px]" />
        {/* Orange Solute Markers (●1個 = 食塩1g) */}
        {particles.map((pt) => (
          <div
            key={pt.id}
            className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-radial from-orange-400 to-amber-600 shadow-sm border border-orange-200/80"
            style={{ left: `${pt.xPct}%`, top: `${pt.yPct}%` }}
            title="食塩 1g ぶんの目印"
          />
        ))}
        {calc.solutionG === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-sky-200/60">空（から）</div>
        )}
      </div>
    </div>
    {/* Readout chip */}
    <div className="mt-1.5 px-2 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-center h-[46px] flex flex-col justify-center">
      <div className="text-[10px] text-slate-400 whitespace-nowrap">
        食塩 <span className="font-bold text-orange-400">{calc.soluteG}g</span> · 水 <span className="font-bold text-sky-300">{calc.waterG}g</span>
      </div>
      <div className={`text-sm font-bold font-mono ${percentClass}`}>
        {percentLabel}
        <span className="text-[10px] font-normal text-slate-400 ml-1">（{calc.solutionG}g）</span>
      </div>
    </div>
  </div>
);

const PanelButton: React.FC<{ tone: 'solute' | 'water'; strong?: boolean; label: string; title: string; disabled?: boolean; onClick: () => void }> = ({
  tone,
  strong,
  label,
  title,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`py-2 text-xs font-bold rounded-lg border transition-colors disabled:opacity-40 ${
      tone === 'solute'
        ? strong
          ? 'text-orange-950 bg-orange-300 hover:bg-orange-200 border-orange-200'
          : 'text-orange-900 bg-orange-200 hover:bg-orange-100 border-orange-100'
        : strong
        ? 'text-sky-950 bg-sky-300 hover:bg-sky-200 border-sky-200'
        : 'text-sky-900 bg-sky-200 hover:bg-sky-100 border-sky-100'
    }`}
  >
    {label}
  </button>
);

const MoveButton: React.FC<{ label: string; title: string; icon: 'right' | 'merge'; emphasized?: boolean; disabled?: boolean; onClick: () => void }> = ({
  label,
  title,
  icon,
  emphasized,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-full py-1.5 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors disabled:opacity-40 ${
      emphasized ? 'text-white bg-emerald-600 hover:bg-emerald-500 border-emerald-400' : 'text-amber-950 bg-amber-200 hover:bg-amber-100 border-amber-100'
    }`}
  >
    {icon === 'merge' && <Combine className="w-3 h-3" />}
    <span>{label}</span>
    {icon === 'right' && <ArrowRight className="w-3 h-3" />}
  </button>
);
