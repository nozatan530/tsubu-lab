import React, { useState, useEffect } from 'react';
import { UnitId, UserProgress, Mission, ViewMode } from '../types';
import { MISSIONS } from '../data/missions';
import { SUBSTANCES } from '../data/cards';
import { ParticleBeaker } from './ParticleBeaker';
import { MolePackLab } from './MolePackLab';
import { MolarFlaskLab } from './MolarFlaskLab';
import { DiagramTape } from './DiagramTape';
import { FormulaDisplay } from './FormulaDisplay';
import { ScaleLegend } from './ScaleLegend';
import { ViewSwitcher } from './ViewSwitcher';
import { MoleScaleExplainer } from './MoleScaleExplainer';
import { MissionView } from './MissionView';
import { Beaker, Sparkles, Scale, Target, Star, ChevronRight, BookOpen, HelpCircle } from 'lucide-react';

interface UnitWorkspaceProps {
  unitId: UnitId;
  progress: UserProgress;
  onOpenCardBook: () => void;
  onOpenAnalogy: () => void;
  onCompleteMission: (missionId: string, stars: number, choiceId: string | null, moves: number) => void;
  onSelectUnit?: (unitId: UnitId) => void;
}

export const UnitWorkspace: React.FC<UnitWorkspaceProps> = ({
  unitId,
  progress,
  onOpenCardBook,
  onOpenAnalogy,
  onCompleteMission,
  onSelectUnit,
}) => {
  // Default sub-tab: for Unit 2, always start with 'scale' (the discovery explainer)
  const [subTab, setSubTab] = useState<'scale' | 'lab' | 'missions'>('lab');

  // Currently playing mission ID (if null, show mission selection list)
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);

  // Sandbox free state
  const [viewMode, setViewMode] = useState<ViewMode>('particles');

  const [unit1State, setUnit1State] = useState({
    soluteG: 10,
    waterG: 90,
    secondBeaker: undefined as { soluteG: number; waterG: number } | undefined,
  });

  const [unit2State, setUnit2State] = useState({
    substanceId: 'NaCl',
    packs: 1.0,
  });

  const [unit3State, setUnit3State] = useState({
    substanceId: 'NaCl',
    packs: 0.1,
    waterML: 495,
  });

  // When unitId changes, reset sub-tab sensibly
  useEffect(() => {
    setActiveMissionId(null);
    if (unitId === 'unit2') {
      // For Unit 2, default to 'scale' if not seen yet, otherwise 'lab'
      setSubTab(progress.hasSeenMoleAnalogy ? 'lab' : 'scale');
    } else {
      setSubTab('lab');
    }
  }, [unitId]);

  const unitMissions = MISSIONS.filter((m) => m.unitId === unitId);
  const completedMissionsCount = unitMissions.filter(
    (m) => progress.completedMissions[m.id]?.completed
  ).length;

  const unitMeta: Record<UnitId, {
    title: string;
    num: string;
    icon: string;
    themeColor: string;
    tagline: string;
    terms: string;
  }> = {
    unit1: {
      title: '質量パーセント濃度',
      num: '①',
      icon: '🟠',
      themeColor: '#ea580c',
      tagline: '分けても濃度は同じ！分母は「水」ではなく「溶液全体」',
      terms: '溶質（食塩）· 溶媒（水）· 溶液全体',
    },
    unit2: {
      title: '物質量（モル）',
      num: '②',
      icon: '📦',
      themeColor: '#d97706',
      tagline: '1粒が軽すぎて測れないから約6000垓個集めた！物質ごとに重さが違う',
      terms: '物質量（パック数）· モル質量（1パックの重さ）',
    },
    unit3: {
      title: 'モル濃度',
      num: '③',
      icon: '🧪',
      themeColor: '#059669',
      tagline: '「水1Lに溶かす」と「溶液全体を1Lにする」は大違い！',
      terms: 'モル濃度（1Lあたりのパック数）· 標線',
    },
    comprehensive: {
      title: '総合演習（実験準備）',
      num: '④',
      icon: '🎯',
      themeColor: '#7c3aed',
      tagline: 'g ⇔ mol ⇔ 体積 ⇔ 濃度 をつなぐ実践問題',
      terms: 'グラム換算 · 試薬調製 · モル濃度の計算',
    },
  };

  const meta = unitMeta[unitId];

  // Active mission navigation
  const currentMissionIndex = unitMissions.findIndex((m) => m.id === activeMissionId);
  const nextMissionInUnit =
    currentMissionIndex >= 0 && currentMissionIndex < unitMissions.length - 1
      ? unitMissions[currentMissionIndex + 1]
      : null;

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-3 sm:px-6 space-y-4 animate-fade-in">
      {/* Unit Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-xs shrink-0"
            style={{ backgroundColor: `${meta.themeColor}15` }}
          >
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">
                単元 {meta.num}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {meta.title}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {meta.tagline}
            </p>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              キーワード: <strong className="text-slate-700">{meta.terms}</strong>
            </div>
          </div>
        </div>

        {/* Card Book shortcut */}
        <button
          type="button"
          onClick={onOpenCardBook}
          className="self-end md:self-center px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>カード帳を見る</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation for this Unit */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/90 pb-2">
        {/* Unit 2 Exclusive: Discovery Scale Tab */}
        {unitId === 'unit2' && (
          <button
            type="button"
            onClick={() => {
              setActiveMissionId(null);
              setSubTab('scale');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'scale' && !activeMissionId
                ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400/50'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>⚖️ モルの仕組みを解き明かそう！</span>
          </button>
        )}

        {/* Lab Sandbox Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveMissionId(null);
            setSubTab('lab');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'lab' && !activeMissionId
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Beaker className="w-3.5 h-3.5 text-amber-400" />
          <span>🧪 実験室（自由操作）</span>
        </button>

        {/* Missions Tab */}
        <button
          type="button"
          onClick={() => {
            setSubTab('missions');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'missions' || activeMissionId
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>🎯 ミッション（全{unitMissions.length}問）</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-700 text-white">
            {completedMissionsCount}/{unitMissions.length}
          </span>
        </button>
      </div>

      {/* Sub-Tab 1: Scale Explainer (Unit 2 Discovery) */}
      {unitId === 'unit2' && subTab === 'scale' && !activeMissionId && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
          <MoleScaleExplainer
            initialSubstanceId={unit2State.substanceId}
            onProceedToPackLab={() => setSubTab('lab')}
            isModal={false}
          />
        </div>
      )}

      {/* Sub-Tab 2: Lab Sandbox (Free Play) */}
      {subTab === 'lab' && !activeMissionId && (
        <div className="space-y-4 animate-fade-in">
          {/* Quick action bar */}
          <div className="p-3 bg-linear-to-r from-slate-900 to-slate-950 text-white rounded-xl flex items-center justify-between gap-3 shadow-xs">
            <span className="text-xs text-slate-300 font-medium">
              🧪 自由に触って確かめられる実験室です。いつでもミッションに挑戦できます！
            </span>
            <button
              type="button"
              onClick={() => setSubTab('missions')}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <span>ミッション一覧へ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />

          <div className="relative">
            <div className="mb-2 flex justify-end">
              <ScaleLegend unitId={unitId} />
            </div>

            {viewMode === 'particles' && (
              <>
                {unitId === 'unit1' && (
                  <ParticleBeaker
                    soluteG={unit1State.soluteG}
                    waterG={unit1State.waterG}
                    secondBeaker={unit1State.secondBeaker}
                    onUpdate={(up) => setUnit1State((p) => ({ ...p, ...up }))}
                  />
                )}

                {unitId === 'unit2' && (
                  <MolePackLab
                    substanceId={unit2State.substanceId}
                    packs={unit2State.packs}
                    onUpdate={(up) => setUnit2State((p) => ({ ...p, ...up }))}
                    onOpenAnalogy={onOpenAnalogy}
                    onOpenCard={onOpenCardBook}
                  />
                )}

                {(unitId === 'unit3' || unitId === 'comprehensive') && (
                  <MolarFlaskLab
                    substanceId={unit3State.substanceId}
                    packs={unit3State.packs}
                    waterML={unit3State.waterML}
                    onUpdate={(up) => setUnit3State((p) => ({ ...p, ...up }))}
                  />
                )}
              </>
            )}

            {viewMode === 'diagram' && (
              <DiagramTape
                unitId={unitId}
                state={
                  unitId === 'unit1'
                    ? unit1State
                    : unitId === 'unit2'
                    ? unit2State
                    : { packs: unit3State.packs, flaskWaterML: unit3State.waterML, substanceId: unit3State.substanceId }
                }
              />
            )}

            {viewMode === 'formula' && (
              <FormulaDisplay
                unitId={unitId}
                state={
                  unitId === 'unit1'
                    ? unit1State
                    : unitId === 'unit2'
                    ? unit2State
                    : { packs: unit3State.packs, flaskWaterML: unit3State.waterML, substanceId: unit3State.substanceId }
                }
              />
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Missions (List or Active Mission) */}
      {(subTab === 'missions' || activeMissionId) && (
        <div className="space-y-4 animate-fade-in">
          {activeMissionId ? (
            <MissionView
              mission={unitMissions.find((m) => m.id === activeMissionId) || unitMissions[0]}
              onBackToMap={() => setActiveMissionId(null)}
              onNextMission={
                nextMissionInUnit ? () => setActiveMissionId(nextMissionInUnit.id) : undefined
              }
              onOpenCardBook={onOpenCardBook}
              onOpenAnalogy={onOpenAnalogy}
              onCompleteMission={onCompleteMission}
            />
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    単元 {meta.num} のミッション一覧
                  </h3>
                  <p className="text-xs text-slate-500">
                    予想を選んでから操作して確かめる探究ミッションです
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  進捗: {completedMissionsCount} / {unitMissions.length} 問クリア
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unitMissions.map((m) => {
                  const userResult = progress.completedMissions[m.id];
                  const isCompleted = userResult?.completed;
                  const stars = userResult?.stars || 0;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveMissionId(m.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                        isCompleted
                          ? 'bg-slate-50/80 border-slate-200 hover:border-slate-400 hover:bg-white'
                          : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          ミッション #{m.order}
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
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                          {m.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {m.question}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>目標 {m.targetMoves}手</span>
                        <span className="flex items-center gap-1 font-bold text-slate-800 group-hover:text-amber-600">
                          <span>{isCompleted ? '再挑戦' : '挑戦する'}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inter-Unit Progression Bridge Banners */}
      {unitId === 'unit1' && !activeMissionId && onSelectUnit && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border border-orange-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block">
              次のステップへ！
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              単元② 物質量（モル）― 1粒から 600垓個（1マス）、6000垓個（1パック）へ！
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              溶液100gあたりの割合（％）の次は、「小さすぎて測れない粒をどうやって数えるか？」の謎を解き明かします。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectUnit('unit2')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>単元② 物質量へ進む</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}

      {unitId === 'unit2' && !activeMissionId && onSelectUnit && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              次のステップへ！
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              単元③ モル濃度 ― メスフラスコと「1Lあたりのパック数」へ！
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              1パック（6000垓個）の重さがわかったら、いよいよ水溶液1Lに溶かしたときの「モル濃度（mol/L）」を観察しましょう。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectUnit('unit3')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>単元③ モル濃度へ進む</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}
    </div>
  );
};
