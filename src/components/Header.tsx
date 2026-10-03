import React from 'react';
import { UnitId } from '../types';
import { BookOpen, RotateCcw, Sparkles, Star } from 'lucide-react';

interface HeaderProps {
  currentTab: 'home' | 'lab' | 'mission';
  currentUnitId: UnitId;
  totalStars: number;
  unlockedCardCount: number;
  onNavigateHome: () => void;
  onNavigateLab: (unitId?: UnitId) => void;
  onOpenCardBook: () => void;
  onResetRequest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUnitId,
  totalStars,
  unlockedCardCount,
  onNavigateHome,
  onNavigateLab,
  onOpenCardBook,
  onResetRequest,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-left group flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <span className="text-base font-black">粒</span>
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors whitespace-nowrap hidden min-[400px]:block sm:block">
              つぶラボ
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block -mt-1">
              高校化学基礎：粒とパックで学ぶシミュレーター
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-0.5 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={onNavigateHome}
            className={`px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'home'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <span className="sm:hidden">マップ</span>
            <span className="hidden sm:inline">単元マップ</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateLab(currentUnitId)}
            className={`px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'lab'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <span className="sm:hidden">実験室</span>
            <span className="hidden sm:inline">実験室（自由操作）</span>
          </button>

          <button
            type="button"
            onClick={onOpenCardBook}
            className="px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
            title="カード帳"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">カード帳</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-mono font-bold px-1.5 py-0.2 rounded-full">
              {unlockedCardCount}
            </span>
          </button>
        </nav>

        {/* Zone 3: Actions & Star Tally */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Star tally */}
          <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-lg">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold font-mono text-amber-900 tabular-nums">
              {totalStars}
            </span>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={onResetRequest}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="記録をすべて消す"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
