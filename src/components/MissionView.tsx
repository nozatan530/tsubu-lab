import React, { useState, useEffect } from 'react';
import { Mission, ViewMode, UnitId } from '../types';
import { ParticleBeaker } from './ParticleBeaker';
import { MolePackLab } from './MolePackLab';
import { MolarFlaskLab } from './MolarFlaskLab';
import { DiagramTape } from './DiagramTape';
import { FormulaDisplay } from './FormulaDisplay';
import { ScaleLegend } from './ScaleLegend';
import { ViewSwitcher } from './ViewSwitcher';
import { ResultModal } from './ResultModal';
import { CheckCircle, Lock, RotateCcw, ArrowRight, BookOpen, HelpCircle, ChevronLeft } from 'lucide-react';

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

  // Reset state when mission changes
  useEffect(() => {
    setSimState({ ...mission.initialState });
    setSelectedPrediction(null);
    setMovesCount(0);
    setIsResultOpen(false);
    setViewMode('particles');
  }, [mission.id]);

  const handleUpdateSim = (updates: any) => {
    // If prediction not made yet, ignore changes
    if (!selectedPrediction) return;
    if (mission.unitId === 'unit3' || mission.unitId === 'comprehensive') {
      // MolarFlaskLab は packs / waterML / substanceId で返すので、ミッションの状態（flask*）に対応づける
      const { packs, waterML, substanceId, ...rest } = updates;
      updates = {
        ...rest,
        ...(packs !== undefined && { flaskPacks: packs }),
        ...(waterML !== undefined && { flaskWaterML: waterML }),
        ...(substanceId !== undefined && { flaskSubstanceId: substanceId }),
      };
    }
    setSimState((prev: any) => ({ ...prev, ...updates }));
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

  return (
    <div className="w-full space-y-4 animate-fade-in">
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

        {/* Prediction Selector: 「どうなると思う？」（予想） */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>🔮</span>
              <span>ステップ1：どうなると思う？（予想を選んでください）</span>
            </span>
            {selectedPrediction && (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                予想選択済み（操作ロック解除）
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {mission.choices.map((c) => {
              const isSelected = selectedPrediction === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedPrediction(c.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-2 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-slate-900 shadow-xs ring-2 ring-amber-400/50'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'border border-slate-300 text-slate-400'
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
      </div>

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
                  substanceId={simState.flaskSubstanceId || simState.substanceId || 'NaCl'}
                  packs={simState.flaskPacks ?? simState.packs ?? 0.1}
                  waterML={simState.flaskWaterML ?? simState.waterML ?? 900}
                  onUpdate={handleUpdateSim}
                  readOnly={isControlsLocked}
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

      {/* Goal Check & Verification Bottom Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <strong className="text-slate-800 block">現在の目標：</strong>
          <span>{mission.goalDescription}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleRetry}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            title="最初の状態に戻す"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>リセット</span>
          </button>

          <button
            type="button"
            onClick={handleVerify}
            disabled={isControlsLocked}
            className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            <span>確かめる（判定）</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Result Modal */}
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
      />
    </div>
  );
};
