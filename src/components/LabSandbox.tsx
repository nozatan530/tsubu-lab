import React, { useState } from 'react';
import { UnitId, ViewMode } from '../types';
import { ParticleBeaker } from './ParticleBeaker';
import { MolePackLab } from './MolePackLab';
import { MolarFlaskLab } from './MolarFlaskLab';
import { DiagramTape } from './DiagramTape';
import { FormulaDisplay } from './FormulaDisplay';
import { ScaleLegend } from './ScaleLegend';
import { ViewSwitcher } from './ViewSwitcher';
import { Beaker, Sparkles, ArrowRight, Play, BookOpen } from 'lucide-react';

interface LabSandboxProps {
  initialUnitId: UnitId;
  onGoToMissions: (unitId: UnitId) => void;
  onOpenCardBook: () => void;
  onOpenAnalogy: () => void;
}

export const LabSandbox: React.FC<LabSandboxProps> = ({
  initialUnitId,
  onGoToMissions,
  onOpenCardBook,
  onOpenAnalogy,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitId>(initialUnitId);
  const [viewMode, setViewMode] = useState<ViewMode>('particles');

  // Sandbox free state
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

  const unitTitles: Record<UnitId, { name: string; desc: string }> = {
    unit1: {
      name: '① 質量パーセント濃度',
      desc: '食塩（粒）と水を自由に入れて、混ぜたり分けたりしてみましょう。',
    },
    unit2: {
      name: '② 物質量（モル）',
      desc: '1パック（1mol）の重さを物質ごとに比べたり、小数のピースを動かしてみましょう。',
    },
    unit3: {
      name: '③ モル濃度',
      desc: 'メスフラスコにパックと水を入れ、標線に合わせてモル濃度の変化を観察しましょう。',
    },
    comprehensive: {
      name: '総合 実験室',
      desc: '各種試薬を秤量・希釈して希望の溶液を作る自由シミュレーション。',
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-3 sm:px-6 space-y-4 animate-fade-in">
      {/* Unit Selector Bar for Sandbox */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
            <Beaker className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              自由実験室（Sandbox）
            </h2>
            <p className="text-xs text-slate-500">お題なし！自由にボタンを触って挙動を試せます</p>
          </div>
        </div>

        {/* Unit tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {(['unit1', 'unit2', 'unit3', 'comprehensive'] as UnitId[]).map((uId) => {
            const isSelected = selectedUnit === uId;
            return (
              <button
                key={uId}
                type="button"
                onClick={() => setSelectedUnit(uId)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {unitTitles[uId].name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free play banner prompting "さわってみよう" */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-linear-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🧪</span>
          <div className="text-xs text-slate-700">
            <strong className="text-slate-900 font-semibold block">
              さわってみよう！まずは30秒ほど自由に動かしてみてください
            </strong>
            <span>{unitTitles[selectedUnit].desc}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onGoToMissions(selectedUnit)}
          className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
        >
          <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>ミッションへ挑戦する</span>
        </button>
      </div>

      {/* 3-Way Switcher */}
      <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />

      {/* Main Interactive Stage */}
      <div className="relative">
        <div className="mb-2 flex justify-end">
          <ScaleLegend unitId={selectedUnit} />
        </div>

        {viewMode === 'particles' && (
          <>
            {selectedUnit === 'unit1' && (
              <ParticleBeaker
                soluteG={unit1State.soluteG}
                waterG={unit1State.waterG}
                secondBeaker={unit1State.secondBeaker}
                onUpdate={(up) => setUnit1State((p) => ({ ...p, ...up }))}
              />
            )}

            {selectedUnit === 'unit2' && (
              <MolePackLab
                substanceId={unit2State.substanceId}
                packs={unit2State.packs}
                onUpdate={(up) => setUnit2State((p) => ({ ...p, ...up }))}
                onOpenAnalogy={onOpenAnalogy}
                onOpenCard={onOpenCardBook}
              />
            )}

            {(selectedUnit === 'unit3' || selectedUnit === 'comprehensive') && (
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
            unitId={selectedUnit}
            state={
              selectedUnit === 'unit1'
                ? unit1State
                : selectedUnit === 'unit2'
                ? unit2State
                : { packs: unit3State.packs, flaskWaterML: unit3State.waterML, substanceId: unit3State.substanceId }
            }
          />
        )}

        {viewMode === 'formula' && (
          <FormulaDisplay
            unitId={selectedUnit}
            state={
              selectedUnit === 'unit1'
                ? unit1State
                : selectedUnit === 'unit2'
                ? unit2State
                : { packs: unit3State.packs, flaskWaterML: unit3State.waterML, substanceId: unit3State.substanceId }
            }
          />
        )}
      </div>
    </div>
  );
};
