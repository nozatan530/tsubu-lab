import React, { useState } from 'react';
import { SUBSTANCES } from '../data/cards';
import { Sparkles, Scale, ArrowRight, CheckCircle2, ChevronRight, X, Layers, Box, Info } from 'lucide-react';

interface MoleScaleExplainerProps {
  initialSubstanceId?: string;
  onClose?: () => void;
  onProceedToPackLab?: () => void;
  isModal?: boolean;
}

interface ScaleStage {
  step: number;
  id: string;
  tabLabel: string;
  countTitle: string;
  exponentText: string;
  molesVal: number; // in moles
  molesDisplay: string;
  activeSlots: number; // 0 to 10 slots
  desc: string;
  reaction: string;
  isPackUnit: boolean;
  highlightNote: string;
}

const SCALE_STAGES: ScaleStage[] = [
  {
    step: 1,
    id: 'single',
    tabLabel: '1粒',
    countTitle: '1 個',
    exponentText: '1 個',
    molesVal: 0,
    molesDisplay: '約 0.0000000000000000000000017 mol',
    activeSlots: 0,
    desc: '目に見えない原子・分子1個そのもの。',
    reaction: '天秤はピクリとも動きません！軽すぎて測定不能です。',
    isPackUnit: false,
    highlightNote: '軽すぎて天秤に乗らない！',
  },
  {
    step: 2,
    id: 'trillion',
    tabLabel: '1兆個',
    countTitle: '1,000,000,000,000 個',
    exponentText: '10¹² 個',
    molesVal: 0.0000000000017,
    molesDisplay: '約 0.0000000000017 mol',
    activeSlots: 0,
    desc: '世界の全人口（約80億人）の100倍以上の大軍勢ですが…',
    reaction: 'まだ 0.000000...g。普通の実験用天秤では全く反応しません！',
    isPackUnit: false,
    highlightNote: '兆の桁でも全然足りない！',
  },
  {
    step: 3,
    id: '1gai',
    tabLabel: '1垓個',
    countTitle: '1 垓（がい）個',
    exponentText: '1.0 × 10²⁰ 個',
    molesVal: 1 / 6022,
    molesDisplay: '約 0.00017 mol',
    activeSlots: 0,
    desc: '京（けい）の1万倍の「垓（がい）」に突入！',
    reaction: 'ピクッ！超精密天秤で、物質ごとの重さの微量な差（0.003g〜0.030g）が出始めます！',
    isPackUnit: false,
    highlightNote: '微量で差が出始める！',
  },
  {
    step: 4,
    id: '10gai',
    tabLabel: '10垓個',
    countTitle: '10 垓個',
    exponentText: '1.0 × 10²¹ 個',
    molesVal: 10 / 6022,
    molesDisplay: '約 0.0017 mol',
    activeSlots: 0,
    desc: '1垓の10倍。数字が少しずつ大きくなってきました。',
    reaction: '天秤の表示が少し動きますが、ビーカーで測るにはまだ軽すぎます。',
    isPackUnit: false,
    highlightNote: '10倍集めた！',
  },
  {
    step: 5,
    id: '100gai',
    tabLabel: '100垓個',
    countTitle: '100 垓個',
    exponentText: '1.0 × 10²² 個',
    molesVal: 100 / 6022,
    molesDisplay: '約 0.017 mol',
    activeSlots: 0,
    desc: '100垓個。あと6倍集めると、ちょうどキリのいい「小分け1個（0.1mol）」に届きます！',
    reaction: '0.30g〜3.00gと、かなり測れる重さに近づいてきました！',
    isPackUnit: false,
    highlightNote: '小分け1個（0.1mol）まであと少し！',
  },
  {
    step: 6,
    id: '600gai',
    tabLabel: '600垓個（小分け1個）',
    countTitle: '約 600 垓個',
    exponentText: '6.02 × 10²² 個',
    molesVal: 0.1,
    molesDisplay: 'ちょうど 0.10 mol（0.1パック）',
    activeSlots: 1,
    desc: '★大注目！これが「1パック（小分け10個）のちょうど1個分」です！',
    reaction: 'カチッ！小分け1個が点灯！1モル（1パック）の1/10の重さになりました！',
    isPackUnit: true,
    highlightNote: '小分け1個 ＝ 約600垓個 ＝ 0.1mol',
  },
  {
    step: 7,
    id: '6000gai',
    tabLabel: '6000垓個（1パック）',
    countTitle: '約 6000 垓個',
    exponentText: '6.02 × 10²³ 個',
    molesVal: 1.0,
    molesDisplay: 'ちょうど 1.00 mol（1パック丸ごと）',
    activeSlots: 10,
    desc: '★★ 600垓個（小分け1個）× 10個 ＝ 約6000垓個（6.02×10²³個）！',
    reaction: '満杯！小分け10個が全部埋まり、実験室でしっかり扱える「モル質量（18g〜180g）」が完成！',
    isPackUnit: true,
    highlightNote: '1パック（小分け10個）＝ 約6000垓個 ＝ 1.0mol',
  },
];

export const MoleScaleExplainer: React.FC<MoleScaleExplainerProps> = ({
  initialSubstanceId = 'H2O',
  onClose,
  onProceedToPackLab,
  isModal = false,
}) => {
  const [selectedSubstanceId, setSelectedSubstanceId] = useState<string>(initialSubstanceId);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(5); // default to step 6 (600垓個) for instant clarity

  const substance = SUBSTANCES[selectedSubstanceId] || SUBSTANCES.H2O;
  const stage = SCALE_STAGES[currentStepIdx];
  const theme = substance.theme;

  // Calculate dynamic mass in grams for current substance at this stage
  const getGramsForStage = (st: ScaleStage) => {
    if (st.id === 'single') return '0.00';
    if (st.id === 'trillion') return '0.00';
    if (st.id === '1gai') return (substance.molarMass / 6022).toFixed(3);
    if (st.id === '10gai') return ((substance.molarMass * 10) / 6022).toFixed(2);
    if (st.id === '100gai') return ((substance.molarMass * 100) / 6022).toFixed(2);
    if (st.id === '600gai') return (substance.molarMass * 0.1).toFixed(2).replace(/\.00$/, '');
    if (st.id === '6000gai') return substance.molarMass.toFixed(1).replace(/\.0$/, '');
    return '0.00';
  };

  const currentGrams = getGramsForStage(stage);

  const content = (
    <div className="flex flex-col gap-5">
      {/* Top Pedagogical Bridge Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-slate-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl sm:text-3xl">⚖️</span>
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              モル（mol）の仕組みを解き明かそう！ — 1粒から 600垓、6000垓個へ
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              原子や分子は<strong>1粒があまりにも軽すぎるため天秤に載せても測れません</strong>。
              <strong>1垓個</strong>で微量な差が出始め、<strong>約600垓個集めると「小分け1個（0.1mol）」</strong>になり、
              <strong>小分け10個（約6000垓個）集まると「1パック丸ごと（1.0mol）」</strong>になって天秤でしっかり測れるグラムになります！
            </p>
          </div>
        </div>
      </div>

      {/* Substance Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold text-slate-700">物質を選んで比較する:</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(SUBSTANCES).map((s) => {
            const isSelected = s.id === selectedSubstanceId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSubstanceId(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs ring-2 scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
                style={isSelected ? { borderColor: s.color } : {}}
              >
                <span>{s.icon}</span>
                <span>{s.formula}</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  ({s.molarMass}g/mol)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP TABS: 1粒 → 1兆個 → 1垓個 → 10垓個 → 100垓個 → 600垓個(小分け1個) → 6000垓個(1パック) */}
      <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-semibold">
          <span>粒の数を段階的に増やしてみよう（タブをタップ）:</span>
          <span className="text-[11px] text-amber-800 font-bold hidden sm:inline">
            ※ 600垓個（小分け1個）と 6000垓個（1パック）に注目！
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {SCALE_STAGES.map((s, idx) => {
            const isActive = currentStepIdx === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIdx(idx)}
                className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md ring-2 ring-amber-400 scale-102 border-slate-900'
                    : s.isPackUnit
                    ? 'bg-white border-amber-300 text-slate-900 hover:bg-amber-50/60'
                    : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                    STEP {s.step}
                  </span>
                  {s.isPackUnit && (
                    <span className="text-xs">📦</span>
                  )}
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-1">
                  {s.tabLabel}
                </div>
                <span className={`text-[10px] leading-none ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {s.id === '600gai' ? '0.1 mol' : s.id === '6000gai' ? '1.0 mol' : s.exponentText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Way Synchronized Interactive State Display: [個数] ⇔ [モル数] ⇔ [小分け10個入りパックの絵] ⇔ [天秤の重さ(g)] */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden space-y-5">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${theme.accent} 2px, transparent 2px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Header of Stage */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold font-mono text-xs">
              STEP {stage.step} / 7
            </span>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{substance.icon} {substance.name} ({substance.formula})</span>
              <span className="text-amber-400 font-mono text-sm">
                ― {stage.countTitle}
              </span>
            </h4>
          </div>

          <div className="text-xs font-medium text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/30">
            {stage.highlightNote}
          </div>
        </div>

        {/* 4 Core Perspectives Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          {/* 1. Number of particles (垓 & exponent) */}
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              ① 粒の個数（垓）
            </span>
            <div>
              <div className="text-lg font-bold font-mono text-sky-300">
                {stage.countTitle}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                （{stage.exponentText}）
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">
              1粒: {substance.singleParticleMass}
            </span>
          </div>

          {/* 2. Moles (パック数) */}
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              ② 物質量（モル数）
            </span>
            <div>
              <div className="text-lg font-bold font-mono text-amber-300">
                {stage.molesVal === 0.1 ? '0.10 mol' : stage.molesVal === 1.0 ? '1.00 mol' : stage.molesVal === 0 ? '0 mol' : `${stage.molesVal.toFixed(4)} mol`}
              </div>
              <div className="text-xs font-sans text-amber-200 mt-0.5 font-bold">
                {stage.id === '600gai' ? '0.1 パック（小分け1個分）' : stage.id === '6000gai' ? '1 パック（満杯）' : 'パック未満'}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">
              6000垓個 ＝ 1.0 mol
            </span>
          </div>

          {/* 3. The 10-Slot Pack Crate (小分け1個 = 600垓個, 1パック = 6000垓個) */}
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              ③ パック（小分け10個入り）
            </span>
            <div className="flex flex-col items-center justify-center my-1">
              {/* 10-slot crate visual */}
              <div className="grid grid-cols-5 gap-1 p-1.5 bg-slate-950 rounded-lg border border-slate-700">
                {Array.from({ length: 10 }).map((_, slotIdx) => {
                  const isActive = slotIdx < stage.activeSlots;
                  return (
                    <div
                      key={`slot-${slotIdx}`}
                      className={`w-5 h-5 rounded-xs flex items-center justify-center text-[10px] transition-all ${
                        isActive
                          ? `${theme.activeSlot} shadow-xs scale-105`
                          : 'bg-slate-800/60 border border-slate-700/50 text-slate-600'
                      }`}
                      title={isActive ? `小分け1個: 約600垓個 (${substance.name})` : '空の枠'}
                    >
                      {isActive ? (
                        <span>{substance.icon}</span>
                      ) : (
                        <span className="text-[8px] opacity-40">○</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-300 font-mono mt-1.5 font-bold">
                {stage.activeSlots === 1
                  ? '小分け1個 点灯（約600垓個）'
                  : stage.activeSlots === 10
                  ? '小分け10個 満杯（約6000垓個）'
                  : '小分け0個（1個に届かない）'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              小分け1個 ＝ 1パックの1/10
            </span>
          </div>

          {/* 4. Real Weight on Lab Scale */}
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              ④ 天秤の重さ（g）
            </span>
            <div>
              <div className="py-1 px-3 bg-slate-950 rounded-lg border border-slate-800 inline-block font-mono">
                <span className={`text-2xl font-extrabold tracking-wider ${stage.isPackUnit ? 'text-emerald-400' : stage.step >= 3 ? 'text-sky-300' : 'text-slate-600'}`}>
                  {currentGrams}
                </span>
                <span className={`text-xs ml-1 font-bold ${stage.isPackUnit ? 'text-emerald-300' : 'text-slate-400'}`}>g</span>
              </div>
              <div className="text-xs font-sans text-slate-300 mt-1 font-medium">
                {stage.id === '600gai'
                  ? `${substance.molarMass}g の 1/10`
                  : stage.id === '6000gai'
                  ? `モル質量そのもの`
                  : stage.reaction}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">
              1パック ＝ {substance.molarMass}g
            </span>
          </div>
        </div>

        {/* Reaction insight statement */}
        <div className="relative z-10 p-3 bg-slate-800/70 rounded-xl border border-slate-700 flex items-center gap-2 text-xs text-slate-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="leading-relaxed">
            <strong>このステップのポイント：</strong> {stage.desc} {stage.reaction}
          </span>
        </div>
      </div>

      {/* The Crucial Connection Summary: 小分け1個(600垓個) ➔ 1パック(6000垓個) ➔ モル質量 */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>つながりのまとめ：なぜ 小分け1個＝600垓個、1パック＝6000垓個なのか？</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col gap-1.5">
            <span className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">1</span>
              <span>小分け1個（0.1パック・0.1mol）＝ 約600垓個</span>
            </span>
            <p className="text-amber-900 leading-relaxed text-[11px]">
              小さすぎる粒を約600垓個集めて、ようやく小分け1個が埋まります。
              重さは <strong>{substance.name} なら {(substance.molarMass * 0.1).toFixed(2)}g</strong>（モル質量の1/10）です！
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col gap-1.5">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">2</span>
              <span>1パック（小分け10個・1.0mol）＝ 約6000垓個</span>
            </span>
            <p className="text-emerald-900 leading-relaxed text-[11px]">
              約600垓個の小分けが10個集まるので、合計で <strong>約6000垓個（6.02×10²³個）</strong>！
              重さは ちょうど <strong>{substance.name} なら {substance.molarMass}g</strong> になります！
            </p>
          </div>
        </div>
      </div>

      {/* CTA: Proceed to Pack Lab */}
      {onProceedToPackLab && (
        <div className="p-4 bg-linear-to-r from-slate-900 to-slate-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="text-xs">
            <strong className="text-amber-400 block text-sm mb-0.5">
              仕組みがわかったら、いよいよパックを動かしてみよう！
            </strong>
            <span className="text-slate-300">
              1パック（約6000垓個）や 0.1小分け（約600垓個）を自由に足したり引いたりできます。
            </span>
          </div>
          <button
            type="button"
            onClick={onProceedToPackLab}
            className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>パック実験室へ進む</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
        <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚖️</span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  モル（mol）の仕組みを解き明かそう！
                </h2>
                <p className="text-xs text-slate-500">1粒 ➔ 1垓 ➔ 10垓 ➔ 100垓 ➔ 600垓（小分け1個）➔ 6000垓個（1パック）</p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-5 overflow-y-auto">
            {content}
          </div>

          {onClose && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>閉じて実験に戻る</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return content;
};
