import React, { useState } from 'react';
import { MoleScaleExplainer } from './MoleScaleExplainer';
import { X, Sparkles, Scale, Box, ArrowRight } from 'lucide-react';

interface AnalogyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'scale' | 'box';
}

export const AnalogyModal: React.FC<AnalogyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'scale',
}) => {
  const [activeTab, setActiveTab] = useState<'scale' | 'box'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeTab === 'scale' ? '⚖️' : '🍊🍉'}</span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                モル（mol）の仕組みを解き明かそう！
              </h2>
              <p className="text-xs text-slate-500">
                1粒の重さの差と、約6000垓個（6.02×10²³個）集める理由
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Scale Simulation and Box Metaphor */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 bg-slate-50 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('scale')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'scale'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>なぜ約6000垓個も集めるの？（天秤シミュレーション）</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('box')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'box'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-orange-600" />
            <span>ミカン箱とスイカ箱のたとえ</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {activeTab === 'scale' ? (
            <MoleScaleExplainer isModal={false} />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Orange box */}
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-center flex flex-col items-center">
                  <span className="text-4xl mb-1">🍊</span>
                  <span className="font-bold text-sm text-orange-950">ミカン 1箱（10個入り）</span>
                  <div className="mt-2 py-1.5 px-4 bg-white rounded-lg border border-orange-300 text-xs font-mono font-bold text-orange-700 shadow-2xs">
                    重さ: 約 1 kg
                  </div>
                  <span className="text-xs text-orange-800/80 mt-1.5 font-medium">
                    1個が軽いから、1箱でも軽い！
                  </span>
                </div>

                {/* Watermelon box */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center flex flex-col items-center">
                  <span className="text-4xl mb-1">🍉</span>
                  <span className="font-bold text-sm text-emerald-950">スイカ 1箱（10個入り）</span>
                  <div className="mt-2 py-1.5 px-4 bg-white rounded-lg border border-emerald-300 text-xs font-mono font-bold text-emerald-700 shadow-2xs">
                    重さ: 約 50 kg
                  </div>
                  <span className="text-xs text-emerald-800/80 mt-1.5 font-medium">
                    1個が重いから、1箱でもずっしり重い！
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2.5 leading-relaxed">
                <p>
                  どちらも同じ<strong>「10個入りの1箱」</strong>ですが、中に入っている果物自体の重さが違うため、<strong>1箱の全体の重さは全く違います</strong>。
                </p>
                <div className="flex items-center gap-2 pt-1 font-semibold text-slate-900 border-t border-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>化学の「モル（mol）」もこれと完全に同じです！</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  1モルは、小さすぎて測れない粒を<strong>約6000垓個（6.02×10²³個）まとめた1箱（1パック）</strong>のこと。
                  水分子（H₂O）は1粒が軽いので1パック集めても <strong>18.0g</strong>、食塩（NaCl）は重いので1パック集めると <strong>58.5g</strong> になります。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>理解できた！実験に戻る</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
