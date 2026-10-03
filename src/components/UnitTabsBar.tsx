import React from 'react';
import { UnitId, UserProgress } from '../types';
import { MISSIONS } from '../data/missions';
import { Star, Map } from 'lucide-react';

interface UnitTabsBarProps {
  currentTab: 'home' | 'unit';
  activeUnitId: UnitId;
  progress: UserProgress;
  onSelectUnit: (unitId: UnitId) => void;
  onSelectHomeMap: () => void;
}

const UNIT_TABS = [
  {
    id: 'unit1' as UnitId,
    num: '①',
    title: '質量パーセント濃度',
    shortTitle: '質量％濃度',
    icon: '🟠',
    color: '#ea580c',
    activeClass: 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs ring-1 ring-orange-500/20',
  },
  {
    id: 'unit2' as UnitId,
    num: '②',
    title: '物質量（モル）',
    shortTitle: '物質量（モル）',
    icon: '📦',
    color: '#d97706',
    activeClass: 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-500/20',
  },
  {
    id: 'unit3' as UnitId,
    num: '③',
    title: 'モル濃度',
    shortTitle: 'モル濃度',
    icon: '🧪',
    color: '#059669',
    activeClass: 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500/20',
  },
  {
    id: 'comprehensive' as UnitId,
    num: '④',
    title: '総合演習',
    shortTitle: '総合演習',
    icon: '🎯',
    color: '#7c3aed',
    activeClass: 'bg-purple-50 border-purple-500 text-purple-950 shadow-xs ring-1 ring-purple-500/20',
  },
];

export const UnitTabsBar: React.FC<UnitTabsBarProps> = ({
  currentTab,
  activeUnitId,
  progress,
  onSelectUnit,
  onSelectHomeMap,
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 scrollbar-none">
          {/* 4 Units Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {UNIT_TABS.map((u) => {
              const isSelected = currentTab === 'unit' && activeUnitId === u.id;
              const unitMissions = MISSIONS.filter((m) => m.unitId === u.id);
              const totalMissions = unitMissions.length;
              const earnedStars = unitMissions.reduce(
                (sum, m) => sum + (progress.completedMissions[m.id]?.stars || 0),
                0
              );
              const maxStars = totalMissions * 3;

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectUnit(u.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? u.activeClass
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm select-none">{u.icon}</span>
                  <span className="hidden md:inline font-mono text-[11px] opacity-75">{u.num}</span>
                  <span className="hidden sm:inline">{u.title}</span>
                  <span className="sm:hidden">{u.shortTitle}</span>

                  {/* Stars pill */}
                  <span
                    className={`ml-1 flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/80 font-bold'
                        : 'bg-slate-200/60 text-slate-600'
                    }`}
                  >
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    <span>{earnedStars}/{maxStars}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Map overview tab */}
          <button
            type="button"
            onClick={onSelectHomeMap}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentTab === 'home'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="単元のつながりとロードマップ全体を見る"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">全体マップ</span>
            <span className="sm:hidden">マップ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
