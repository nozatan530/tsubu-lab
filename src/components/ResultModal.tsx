import React, { useState } from 'react';
import { Mission, ViewMode } from '../types';
import { ParticleBeaker } from './ParticleBeaker';
import { MolePackLab } from './MolePackLab';
import { MolarFlaskLab } from './MolarFlaskLab';
import { DiagramTape } from './DiagramTape';
import { FormulaDisplay } from './FormulaDisplay';
import { Star, CheckCircle2, RotateCcw, ArrowRight, Home, HelpCircle } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  mission: Mission;
  starsEarned: number; // 1 to 3
  isPredictionCorrect: boolean;
  predictedChoiceId: string | null;
  movesUsed: number;
  finalState: any;
  feedbackText: string;
  particleExplanation: string;
  onRetry: () => void;
  onNext: () => void;
  onHome: () => void;
  hasNextMission: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  mission,
  starsEarned,
  isPredictionCorrect,
  predictedChoiceId,
  movesUsed,
  finalState,
  feedbackText,
  particleExplanation,
  onRetry,
  onNext,
  onHome,
  hasNextMission,
}) => {
  const [activeTab, setActiveTab] = useState<ViewMode>('particles');

  if (!isOpen) return null;

  const predictedChoice = mission.choices.find((c) => c.id === predictedChoiceId);
  const correctChoice = mission.choices.find((c) => c.isCorrect);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Header with Star Rating */}
        <div className="px-6 py-5 bg-linear-to-r from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
              ミッション達成！
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-sans mt-0.5">
              {mission.title}
            </h2>
          </div>

          {/* Stars display */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-6 h-6 transition-all ${
                  starIdx <= starsEarned
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] scale-110'
                    : 'text-slate-600'
                }`}
              />
            ))}
            <span className="text-xs font-mono font-bold text-amber-300 ml-1">
              {starsEarned} / 3
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Star Breakdown explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>クリア達成 (★1)</span>
            </div>

            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg border font-medium ${
                isPredictionCorrect
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <Star className={`w-4 h-4 shrink-0 ${isPredictionCorrect ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span>予想的中: {isPredictionCorrect ? '正解！(+★1)' : '惜しい！'}</span>
            </div>

            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg border font-medium ${
                movesUsed <= mission.targetMoves
                  ? 'bg-sky-50 border-sky-200 text-sky-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <Star className={`w-4 h-4 shrink-0 ${movesUsed <= mission.targetMoves ? 'text-sky-500 fill-sky-500' : 'text-slate-400'}`} />
              <span>目標手数以内 ({movesUsed}/{mission.targetMoves}手: {movesUsed <= mission.targetMoves ? '+★1' : '超過'})</span>
            </div>
          </div>

          {/* Prediction vs Result Comparison Panel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              あなたの予想と実際の検証結果
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block mb-0.5">あなたの最初の予想:</span>
                <span className="font-semibold text-slate-800">
                  {predictedChoice ? predictedChoice.label : '未選択'}
                </span>
                {isPredictionCorrect ? (
                  <span className="text-emerald-600 font-bold block mt-1 text-[11px]">
                    ✓ 予想どおりでした！
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium block mt-1 text-[11px]">
                    💡 実際の結果: {correctChoice?.label}
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block mb-0.5">確かめた結果:</span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {feedbackText}
                </p>
              </div>
            </div>

            {/* Gentle explanation of "Why" using particles (責める言い方にしない) */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-950 flex items-start gap-2 leading-relaxed">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 block font-semibold mb-0.5">
                  粒の見方で考えると：
                </strong>
                <span>{particleExplanation}</span>
              </div>
            </div>
          </div>

          {/* 3-View Comparison: 粒 · 図 · 式 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                粒・図・式の3つの見方で並べて見比べる
              </span>

              {/* View selector buttons */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('particles')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    activeTab === 'particles'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  粒の絵
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('diagram')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    activeTab === 'diagram'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  図（帯グラフ）
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('formula')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    activeTab === 'formula'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  式（計算）
                </button>
              </div>
            </div>

            {/* Display Active View in read-only mode */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              {activeTab === 'particles' && (
                <>
                  {mission.unitId === 'unit1' && (
                    <ParticleBeaker
                      soluteG={finalState.soluteG ?? 10}
                      waterG={finalState.waterG ?? 90}
                      secondBeaker={finalState.secondBeaker}
                      onUpdate={() => {}}
                      readOnly={true}
                    />
                  )}
                  {mission.unitId === 'unit2' && (
                    <MolePackLab
                      substanceId={finalState.substanceId || 'NaCl'}
                      packs={finalState.packs ?? 1.0}
                      onUpdate={() => {}}
                      readOnly={true}
                    />
                  )}
                  {(mission.unitId === 'unit3' || mission.unitId === 'comprehensive') && (
                    <MolarFlaskLab
                      substanceId={finalState.flaskSubstanceId || finalState.substanceId || 'NaCl'}
                      packs={finalState.flaskPacks ?? finalState.packs ?? 0.1}
                      waterML={finalState.flaskWaterML ?? finalState.waterML ?? 900}
                      onUpdate={() => {}}
                      readOnly={true}
                    />
                  )}
                </>
              )}

              {activeTab === 'diagram' && (
                <DiagramTape unitId={mission.unitId} state={finalState} />
              )}

              {activeTab === 'formula' && (
                <FormulaDisplay unitId={mission.unitId} state={finalState} />
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onHome}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>マップへ戻る</span>
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>もう一度</span>
            </button>
          </div>

          {hasNextMission ? (
            <button
              type="button"
              onClick={onNext}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>次のミッションへ</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onHome}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>単元クリア！マップへ</span>
              <CheckCircle2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
