import React from 'react';
import { UnitId, UserProgress } from '../types';
import { MISSIONS } from '../data/missions';
import { Star, ChevronRight, Play, Sparkles, BookOpen, Layers, Beaker, HelpCircle } from 'lucide-react';

interface HomeMapProps {
  progress: UserProgress;
  onSelectUnitLab: (unitId: UnitId) => void;
  onSelectMission: (missionId: string) => void;
  onOpenCardBook: () => void;
  onOpenAnalogy: () => void;
}

const UNITS = [
  {
    id: 'unit1' as UnitId,
    num: '①',
    title: '質量パーセント濃度',
    concept: '●（食塩1gぶん）と液面の高さで「割合」を見る',
    tagline: '分けても濃度は不変！分母は「水」ではなく「溶液全体」',
    color: 'from-orange-500 to-amber-500',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50/40',
    iconBg: 'bg-orange-100 text-orange-600',
    icon: '🟠',
    terms: '溶質（食塩）· 溶媒（水）· 溶液全体',
  },
  {
    id: 'unit2' as UnitId,
    num: '②',
    title: '物質量（モル）',
    concept: '1パック（6.02×10²³個）の箱と10個の小分け',
    tagline: 'ミカン箱とスイカ箱！物質によって1パックの重さが違う',
    color: 'from-amber-500 to-yellow-500',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50/40',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: '📦',
    terms: '物質量（パック数）· モル質量（1パックの重さ）',
  },
  {
    id: 'unit3' as UnitId,
    num: '③',
    title: 'モル濃度',
    concept: '目盛り付きメスフラスコと標線合わせ',
    tagline: '「水1Lに溶かす」と「溶液全体を1Lにする」は大違い！',
    color: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50/40',
    iconBg: 'bg-emerald-100 text-emerald-600',
    icon: '🧪',
    terms: 'モル濃度（1Lあたりのパック数）· 標線',
  },
  {
    id: 'comprehensive' as UnitId,
    num: '総合',
    title: '総合演習（実験準備）',
    concept: 'g ⇔ mol ⇔ 体積 ⇔ 濃度 をつなぐ実践問題',
    tagline: 'カード帳を片手に、実験室で必要な食塩やブドウ糖を計量！',
    color: 'from-purple-500 to-indigo-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50/40',
    iconBg: 'bg-purple-100 text-purple-600',
    icon: '🎯',
    terms: 'グラム換算 · 試薬調製 · モル濃度の計算',
  },
];

export const HomeMap: React.FC<HomeMapProps> = ({
  progress,
  onSelectUnitLab,
  onSelectMission,
  onOpenCardBook,
  onOpenAnalogy,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-8 animate-fade-in">
      {/* Hero Learning Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #f59e0b 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              高校化学基礎 シミュレーション学習
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-white">
              つぶラボで体験する「量」と「割合」
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              公式の丸暗記はもういりません。
              <strong>「予想する → 粒を動かして確かめる → 粒・図・式の3つで見比べる」</strong>
              ことで、モルと濃度の仕組みがスッキリ腑に落ちます。
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCardBook}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center justify-between gap-3 shadow-xs"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>モル質量カード帳</span>
              </span>
              <span className="font-mono text-[11px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/30">
                {progress.unlockedCards.length}枚解禁
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenAnalogy}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center justify-between gap-3 shadow-xs"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">⚖️</span>
                <span>なぜ約6000垓個も集めるの？</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Road Map Units */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">単元ロードマップ</h2>
            <p className="text-xs text-slate-500">どの単元からでも自由に挑戦できます</p>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            授業に合わせて単元を選ぼう
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {UNITS.map((unit, index) => {
            const unitMissions = MISSIONS.filter((m) => m.unitId === unit.id);
            const totalMissions = unitMissions.length;
            const completedCount = unitMissions.filter(
              (m) => progress.completedMissions[m.id]?.completed
            ).length;
            const earnedStars = unitMissions.reduce(
              (sum, m) => sum + (progress.completedMissions[m.id]?.stars || 0),
              0
            );
            const maxStars = totalMissions * 3;

            return (
              <div
                key={unit.id}
                className={`rounded-2xl border ${unit.borderColor} bg-white shadow-sm overflow-hidden transition-all hover:shadow-md`}
              >
                {/* Unit Header Bar */}
                <div className={`p-4 sm:p-5 ${unit.bgColor} border-b ${unit.borderColor} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-2xl shrink-0">
                      {unit.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-500 font-mono">
                          単元 {unit.num}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {unit.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {unit.tagline}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1 font-medium">
                        言い換え用語: <strong className="text-slate-700">{unit.terms}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Stars for this Unit */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Stars */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-amber-900 shadow-2xs">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{earnedStars} / {maxStars}</span>
                    </div>

                    {/* Free Lab Button */}
                    <button
                      type="button"
                      onClick={() => onSelectUnitLab(unit.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="この単元の実験室で自由に触ってみる"
                    >
                      <Beaker className="w-3.5 h-3.5 text-slate-600" />
                      <span>実験室で遊ぶ</span>
                    </button>
                  </div>
                </div>

                {/* Missions List Grid inside this Unit */}
                <div className="p-4 sm:p-5 bg-white">
                  <span className="text-xs font-bold text-slate-700 block mb-3">
                    ミッション一覧（全{totalMissions}問・進捗: {completedCount}/{totalMissions}）
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {unitMissions.map((m) => {
                      const userResult = progress.completedMissions[m.id];
                      const isCompleted = userResult?.completed;
                      const stars = userResult?.stars || 0;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onSelectMission(m.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group ${
                            isCompleted
                              ? 'bg-slate-50/70 border-slate-200 hover:border-slate-400 hover:bg-white'
                              : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              #{m.order}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= stars
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                              {m.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {m.subtitle}
                            </p>
                          </div>

                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span>目標 {m.targetMoves}手</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-600 group-hover:text-slate-900">
                              <span>挑戦</span>
                              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
