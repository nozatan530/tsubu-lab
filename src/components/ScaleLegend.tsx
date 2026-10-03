import React from 'react';
import { UnitId } from '../types';

interface ScaleLegendProps {
  unitId: UnitId;
  className?: string;
}

export const ScaleLegend: React.FC<ScaleLegendProps> = ({ unitId, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-xs font-mono tracking-tight shadow-xs ${className}`}
      title="現在の表示ルール（縮尺の約束）"
    >
      <span className="text-slate-400 font-sans font-semibold text-[11px]">縮尺の約束:</span>
      {unitId === 'unit1' && (
        <div className="flex items-center gap-2 font-sans text-[11px]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs"></span>
            <span className="text-orange-200">1粒 ＝ 1g（溶質）</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-xs bg-sky-400"></span>
            <span className="text-sky-200">水は液面の高さ</span>
          </span>
        </div>
      )}
      {unitId === 'unit2' && (
        <div className="flex items-center gap-2 font-sans text-[11px]">
          <span className="flex items-center gap-1">
            <span className="inline-block px-1 rounded-xs bg-amber-500 text-slate-950 font-bold text-[10px]">📦 1箱</span>
            <span className="text-amber-200">＝ 約6000垓個（6.02×10²³個 ＝ 1mol）</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">小分け1個 ＝ 0.1mol</span>
        </div>
      )}
      {(unitId === 'unit3' || unitId === 'comprehensive') && (
        <div className="flex items-center gap-2 font-sans text-[11px]">
          <span className="flex items-center gap-1">
            <span className="text-emerald-300">🧪 標線 ＝ 溶液全体の体積</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-200">1パック ＝ 1mol</span>
        </div>
      )}
    </div>
  );
};
