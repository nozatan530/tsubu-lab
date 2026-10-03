import React from 'react';
import { ViewMode } from '../types';
import { CircleDot, BarChart3, Calculator } from 'lucide-react';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/95 p-1.5 rounded-xl border border-slate-200/80 shadow-xs ${className}`}>
      {/* 3 Modes Segmented Control */}
      <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => onViewChange('particles')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            currentView === 'particles'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-950/5'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <CircleDot className={`w-3.5 h-3.5 ${currentView === 'particles' ? 'text-orange-500' : 'text-slate-400'}`} />
          <span>粒（ビーカー・パック）</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('diagram')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            currentView === 'diagram'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-950/5'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <BarChart3 className={`w-3.5 h-3.5 ${currentView === 'diagram' ? 'text-sky-500' : 'text-slate-400'}`} />
          <span>図（線分・帯グラフ）</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('formula')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            currentView === 'formula'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-950/5'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Calculator className={`w-3.5 h-3.5 ${currentView === 'formula' ? 'text-purple-600' : 'text-slate-400'}`} />
          <span>式（公式・計算）</span>
        </button>
      </div>

      {/* Synchronized color code guide */}
      <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-medium text-slate-500 pr-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span>溶質（食塩・パック）</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          <span>水</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>溶液全体</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
          <span>濃度（割合）</span>
        </span>
      </div>
    </div>
  );
};
