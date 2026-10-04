import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mission, ViewMode, UnitId } from '../types';
import { ParticleBeaker } from './ParticleBeaker';
import { MolePackLab } from './MolePackLab';
import { MolarFlaskLab } from './MolarFlaskLab';
import { DiagramTape } from './DiagramTape';
import { FormulaDisplay } from './FormulaDisplay';
import { ScaleLegend } from './ScaleLegend';
import { ViewSwitcher } from './ViewSwitcher';
import { ResultModal } from './ResultModal';
import { flaskFromMissionState, toMissionUpdates } from '../utils/operations';
import { MISSION_GOALS } from '../data/missionGoals';
import { CheckCircle, Circle, Lock, RotateCcw, ArrowRight, BookOpen, ChevronLeft, Eye } from 'lucide-react';

interface MissionViewProps {
  mission: Mission;
  onBackToMap: () => void;
  onNextMission?: () => void;
  onOpenCardBook: () => void;
  onOpenAnalogy: () => void;
  onCompleteMission: (missionId: string, stars: number, choiceId: string | null, moves: number) => void;
}

export const MissionView: React.FC<MissionViewProps> = ({
  mission,
  onBackToMap,
  onNextMission,
  onOpenCardBook,
  onOpenAnalogy,
  onCompleteMission,
}) => {
  // Current view mode: 'particles' | 'diagram' | 'formula'
  const [viewMode, setViewMode] = useState<ViewMode>('particles');

  // Prediction state
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  // Moves counter
  const [movesCount, setMovesCount] = useState<number>(0);

  // Simulation internal state initialized from mission
  const [simState, setSimState] = useState<any>({ ...mission.initialState });

  // Evaluation & Result modal state
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [resultStars, setResultStars] = useState<number>(1);
  const [isPredCorrect, setIsPredCorrect] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [particleExplain, setParticleExplain] = useState<string>('');
  // 予想は、操作を始める前なら変えられる（操作すると結果が見えるため、その後は変えられない）
  const [isEditingPrediction, setIsEditingPrediction] = useState(false);

  // Reset state when mission changes
  useEffect(() => {
    setSimState({ ...mission.initialState });
    setSelectedPrediction(null);
    setMovesCount(0);
    setIsResultOpen(false);
    setViewMode('particles');
    setIsEditingPrediction(false);
    // ミッションを開いたら、問題文が見える位置（ミッションの先頭）から始める
    rootRef.current?.scrollIntoView({ block: 'start' });
  }, [mission.id]);

  const rootRef = useRef<HTMLDivElement>(null);

  const handleUpdateSim = (updates: any) => {
    // If prediction not made yet, ignore changes
    if (!selectedPrediction) return;
    // MolarFlaskLab は packs / waterML / substanceId で返すので、ミッションの状態（flask*）に対応づける
    const missionUpdates = toMissionUpdates(mission.unitId, updates);
    setSimState((prev: any) => ({ ...prev, ...missionUpdates }));
    setMovesCount((prev) => prev + 1);
  };

  const handleVerify = () => {
    if (!selectedPrediction) return;

    // Run chemistry evaluation logic
    const evalResult = mission.checkCompletion(simState, selectedPrediction);

    if (!evalResult.isSuccess) {
      // 未達成：星も記録も付けず、ヒントだけ出して操作を続けてもらう
      setIsSuccess(false);
      setFeedbackMessage(evalResult.feedback);
      setIsResultOpen(true);
      return;
    }
    setIsSuccess(true);

    const chosenChoice = mission.choices.find((c) => c.id === selectedPrediction);
    const isChoiceCorrect = !!chosenChoice?.isCorrect;

    // Star calculation:
    // Clear = 1 star
    // Correct prediction = +1 star
    // Target moves = +1 star
    let stars = 1;
    if (isChoiceCorrect) stars += 1;
    if (movesCount <= mission.targetMoves) stars += 1;

    setIsPredCorrect(isChoiceCorrect);
    setResultStars(stars);
    setFeedbackMessage(evalResult.feedback);
    setParticleExplain(evalResult.particleExplanation);
    setIsResultOpen(true);

    onCompleteMission(mission.id, stars, selectedPrediction, movesCount);
  };

  const handleRetry = () => {
    setSimState({ ...mission.initialState });
    setSelectedPrediction(null);
    setMovesCount(0);
    setIsResultOpen(false);
  };

  const isControlsLocked = !selectedPrediction;

  // 「つくる目標」：いまの状態で各項目に ✓ が付くか、全体として判定でクリアになるか
  const goalSpec = MISSION_GOALS[mission.id];
  const goalRows =
    goalSpec?.kind === 'make'
      ? goalSpec.goals.map((g) => ({ label: g.label, current: g.current(simState), done: g.done(simState) }))
      : [];
  const doneCount = goalRows.filter((g) => g.done).length;
  const isReady = !!selectedPrediction && mission.checkCompletion(simState, selectedPrediction).isSuccess;

  const canChangePrediction = movesCount === 0;
  const goalCardRef = useRef<HTMLDivElement>(null);

  const handleSelectPrediction = (choiceId: string) => {
    const isFirstChoice = !selectedPrediction;
    setSelectedPrediction(choiceId);
    setIsEditingPrediction(false);
    // 予想を選んだら「つくって確かめる」へ自動で移る
    if (isFirstChoice) {
      requestAnimationFrame(() => goalCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  const step = !selectedPrediction ? 1 : isResultOpen ? 3 : 2;
  const predictedChoice = mission.choices.find((c) => c.id === selectedPrediction);

  return (
    <div ref={rootRef} className="w-full space-y-4 animate-fade-in pb-16 sm:pb-0 scroll-mt-16">
      {/* Top Breadcrumb & Quick Actions（320px 幅では右側が次の行に回る） */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToMap}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 py-1.5 px-1.5 sm:px-2.5 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>ミッション一覧へ</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Moles Card Book quick trigger */}
          {(mission.unitId === 'unit2' || mission.unitId === 'unit3' || mission.unitId === 'comprehensive') && (
            <button
              type="button"
              onClick={onOpenCardBook}
              className="text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="カード帳を見る"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">カード帳を見る</span>
              <span className="sm:hidden">カード帳</span>
            </button>
          )}

          {/* Moves count indicator */}
          <div className="text-xs font-mono font-bold px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 whitespace-nowrap">
            手数: <span className="text-slate-900">{movesCount}</span>
            <span className="text-slate-400 font-normal ml-1">/ 目標 {mission.targetMoves}手</span>
          </div>
        </div>
      </div>

      {/* Step bar：いまどの段階か */}
      <ol className="grid grid-cols-3 gap-1.5 text-[11px] sm:text-xs font-bold">
        {['予想する', 'つくって確かめる', '判定'].map((label, i) => {
          const n = i + 1;
          const state = n < step ? 'done' : n === step ? 'current' : 'todo';
          return (
            <li
              key={label}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border text-center ${
                state === 'current'
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : state === 'done'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  state === 'current' ? 'bg-amber-400 text-slate-950' : state === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                }`}
              >
                {state === 'done' ? '✓' : n}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      {/* Question / Mission Prompt Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-start sm:items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 whitespace-nowrap shrink-0 mt-0.5 sm:mt-0">
            ミッション #{mission.order}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {mission.title}
          </h2>
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100">
          {mission.question}
        </p>

        {/* Prediction Selector：予想を選ぶまでは選択肢、選んだあとは1行にたたむ */}
        {selectedPrediction && !isEditingPrediction ? (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-start gap-1.5 text-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>あなたの予想：</strong>
                {predictedChoice?.label}
              </span>
            </span>
            {canChangePrediction ? (
              <button
                type="button"
                onClick={() => setIsEditingPrediction(true)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
              >
                予想を変える
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">操作を始めたので予想は変えられません（リセットでやり直せます）</span>
            )}
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>🔮</span>
              <span>① どうなると思う？ 予想を1つ選ぼう</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {mission.choices.map((c) => {
                const isSelected = selectedPrediction === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectPrediction(c.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-slate-900 shadow-xs ring-2 ring-amber-400/50'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'border border-slate-300 text-slate-400'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="leading-snug">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Goal card：② つくって確かめる（予想を選んだら表示。PC では上に貼りついて、操作しながら見られる） */}
      {selectedPrediction && (
        <div
          ref={goalCardRef}
          className="scroll-mt-20 sm:sticky sm:top-[60px] z-20 bg-white p-3 sm:p-4 rounded-2xl border-2 border-amber-300 shadow-md space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>🧪</span>
              <span>② つくって確かめよう</span>
              {goalSpec?.kind === 'make' && (
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  ✓ {doneCount}/{goalRows.length}
                </span>
              )}
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                title="最初の状態に戻す"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>リセット</span>
              </button>
              <VerifyButton isReady={isReady} onClick={handleVerify} />
            </div>
          </div>

          {goalSpec?.kind === 'make' ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {goalRows.map((g) => (
                <li
                  key={g.label}
                  className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border text-xs ${
                    g.done ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {g.done ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className="flex-1">
                    <span className="font-semibold">{g.label}</span>
                    <span className="block text-[11px] opacity-75 font-mono">{g.current}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-start gap-2 text-xs text-slate-700 bg-sky-50 border border-sky-200 rounded-lg px-2.5 py-2">
              <Eye className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>見て確かめるミッション：</strong>
                {goalSpec?.kind === 'observe' ? goalSpec.hint : mission.goalDescription}
                。見終わったら「確かめる」を押そう。
              </span>
            </p>
          )}
        </div>
      )}

      {/* 3-View Switcher: 粒 · 図 · 式 */}
      <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />

      {/* Main Interactive Stage & Controls */}
      <div className="relative">
        {/* Scale Legend displayed at corner */}
        <div className="mb-2 flex justify-end">
          <ScaleLegend unitId={mission.unitId} />
        </div>

        {/* Lock overlay if prediction is not selected */}
        {isControlsLocked && (
          <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center text-amber-400 shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">先に予想を選んでみましょう！</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">
                「どうなると思う？」の選択肢を1つ選ぶと、操作パネルのロックが解除されます。
              </p>
            </div>
          </div>
        )}

        {/* Active View Render */}
        <div className="transition-all">
          {viewMode === 'particles' && (
            <>
              {mission.unitId === 'unit1' && (
                <ParticleBeaker
                  soluteG={simState.soluteG ?? 10}
                  waterG={simState.waterG ?? 90}
                  secondBeaker={simState.secondBeaker}
                  onUpdate={handleUpdateSim}
                  readOnly={isControlsLocked}
                />
              )}

              {mission.unitId === 'unit2' && (
                <MolePackLab
                  substanceId={simState.substanceId || 'NaCl'}
                  packs={simState.packs ?? 1.0}
                  onUpdate={handleUpdateSim}
                  readOnly={isControlsLocked}
                  onOpenAnalogy={onOpenAnalogy}
                  onOpenCard={onOpenCardBook}
                />
              )}

              {(mission.unitId === 'unit3' || mission.unitId === 'comprehensive') && (
                <MolarFlaskLab
                  {...flaskFromMissionState(simState)}
                  onUpdate={handleUpdateSim}
                  readOnly={isControlsLocked}
                  showMassAndDensity={mission.unitId === 'comprehensive'}
                />
              )}
            </>
          )}

          {viewMode === 'diagram' && (
            <DiagramTape unitId={mission.unitId} state={simState} />
          )}

          {viewMode === 'formula' && (
            <FormulaDisplay unitId={mission.unitId} state={simState} />
          )}
        </div>
      </div>

      {/* スマホ：画面下に固定する「確かめる」バー（親の transform の影響を受けないよう body 直下に出す） */}
      {selectedPrediction &&
        !isResultOpen &&
        createPortal(
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 flex items-center gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={handleRetry}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              title="最初の状態に戻す"
              aria-label="リセット"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="flex-1 text-xs font-bold text-slate-700">
              {goalSpec?.kind === 'make' ? `目標 ✓ ${doneCount}/${goalRows.length}` : '見て確かめよう'}
            </span>
            <VerifyButton isReady={isReady} onClick={handleVerify} />
          </div>,
          document.body
        )}

      {/* Result Modal：親の animate-fade-in（transform）の影響で fixed が画面からずれないよう、body 直下に出す */}
      {createPortal(
        <ResultModal
          isOpen={isResultOpen}
          isSuccess={isSuccess}
          mission={mission}
          starsEarned={resultStars}
          isPredictionCorrect={isPredCorrect}
          predictedChoiceId={selectedPrediction}
          movesUsed={movesCount}
          finalState={simState}
          feedbackText={feedbackMessage}
          particleExplanation={particleExplain}
          onRetry={handleRetry}
          onContinue={() => setIsResultOpen(false)}
          onNext={() => {
            setIsResultOpen(false);
            if (onNextMission) onNextMission();
          }}
          onHome={onBackToMap}
          hasNextMission={!!onNextMission}
        />,
        document.body
      )}
    </div>
  );
};

// 「確かめる」ボタン。目標を全部達成したら緑色で「できた！確かめる」にする
const VerifyButton: React.FC<{ isReady: boolean; onClick: () => void }> = ({ isReady, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 sm:px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap ${
      isReady ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300 animate-pulse' : 'bg-slate-900 hover:bg-slate-800'
    }`}
  >
    <span>{isReady ? 'できた！確かめる' : '確かめる（判定）'}</span>
    <ArrowRight className={`w-4 h-4 ${isReady ? 'text-white' : 'text-amber-400'}`} />
  </button>
);
