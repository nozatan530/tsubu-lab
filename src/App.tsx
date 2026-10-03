import React, { useState, useEffect } from 'react';
import { UnitId, UserProgress } from './types';
import { MISSIONS } from './data/missions';
import { loadUserProgress, saveUserProgress, resetAllUserProgress } from './utils/storage';
import { Header } from './components/Header';
import { UnitTabsBar } from './components/UnitTabsBar';
import { UnitWorkspace } from './components/UnitWorkspace';
import { HomeMap } from './components/HomeMap';
import { CardBookModal } from './components/CardBookModal';
import { AnalogyModal } from './components/AnalogyModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);

  // Tab mode: 'unit' (individual unit workspace) or 'home' (birds-eye roadmap)
  const [currentTab, setCurrentTab] = useState<'home' | 'unit'>('unit');
  const [activeUnitId, setActiveUnitId] = useState<UnitId>('unit1');

  // Modals state
  const [isCardBookOpen, setIsCardBookOpen] = useState<boolean>(false);
  const [isAnalogyOpen, setIsAnalogyOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Save progress changes to storage
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Compute total stars earned across all missions
  const totalStars = Object.values(progress.completedMissions).reduce(
    (sum, m) => sum + (m.stars || 0),
    0
  );

  // Handler: Selecting a unit from Home Map or Tab bar
  const handleSelectUnit = (unitId: UnitId) => {
    setActiveUnitId(unitId);
    setCurrentTab('unit');

    // If unit2 and analogy hasn't been shown yet, trigger analogy modal
    if (unitId === 'unit2' && !progress.hasSeenMoleAnalogy) {
      setIsAnalogyOpen(true);
      setProgress((prev) => ({ ...prev, hasSeenMoleAnalogy: true }));
    }
  };

  // Handler: Selecting a specific mission from Home Map
  const handleSelectMission = (missionId: string) => {
    const targetMission = MISSIONS.find((m) => m.id === missionId);
    if (!targetMission) return;

    setActiveUnitId(targetMission.unitId);
    setCurrentTab('unit');
  };

  // Handler: Completing a mission
  const handleCompleteMission = (
    missionId: string,
    stars: number,
    choiceId: string | null,
    moves: number
  ) => {
    const currentMission = MISSIONS.find((m) => m.id === missionId);
    setProgress((prev) => {
      const prevStars = prev.completedMissions[missionId]?.stars || 0;
      const updatedStars = Math.max(prevStars, stars);

      // Check card unlocks
      const nextUnlockedCards = [...prev.unlockedCards];
      if (currentMission?.unlockedCardId && !nextUnlockedCards.includes(currentMission.unlockedCardId)) {
        nextUnlockedCards.push(currentMission.unlockedCardId);
      }

      return {
        ...prev,
        completedMissions: {
          ...prev.completedMissions,
          [missionId]: {
            completed: true,
            stars: updatedStars,
            predictedChoiceId: choiceId ?? undefined,
            movesUsed: moves,
          },
        },
        unlockedCards: nextUnlockedCards,
      };
    });
  };

  // Handler: Reset progress
  const handleConfirmReset = () => {
    const reset = resetAllUserProgress();
    setProgress(reset);
    setActiveUnitId('unit1');
    setCurrentTab('unit');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <Header
        currentTab={currentTab === 'home' ? 'home' : 'lab'}
        currentUnitId={activeUnitId}
        totalStars={totalStars}
        unlockedCardCount={progress.unlockedCards.length}
        onNavigateHome={() => setCurrentTab('home')}
        onNavigateLab={(unitId) => {
          if (unitId) setActiveUnitId(unitId);
          setCurrentTab('unit');
        }}
        onOpenCardBook={() => setIsCardBookOpen(true)}
        onResetRequest={() => setIsResetConfirmOpen(true)}
      />

      {/* Prominent Unit Tabs Navigation (① 質量% / ② 物質量 / ③ モル濃度 / ④ 総合 / 全体マップ) */}
      <UnitTabsBar
        currentTab={currentTab}
        activeUnitId={activeUnitId}
        progress={progress}
        onSelectUnit={handleSelectUnit}
        onSelectHomeMap={() => setCurrentTab('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' ? (
          <HomeMap
            progress={progress}
            onSelectUnitLab={handleSelectUnit}
            onSelectMission={handleSelectMission}
            onOpenCardBook={() => setIsCardBookOpen(true)}
            onOpenAnalogy={() => setIsAnalogyOpen(true)}
          />
        ) : (
          <UnitWorkspace
            unitId={activeUnitId}
            progress={progress}
            onOpenCardBook={() => setIsCardBookOpen(true)}
            onOpenAnalogy={() => setIsAnalogyOpen(true)}
            onCompleteMission={handleCompleteMission}
            onSelectUnit={handleSelectUnit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 px-4 bg-white text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>つぶラボ — 高校化学基礎 粒子概念学習プラットフォーム</span>
          <span className="text-[11px] text-slate-400">
            データはブラウザ（localStorage）に安全に保存されます
          </span>
        </div>
      </footer>

      {/* Modals */}
      <CardBookModal
        isOpen={isCardBookOpen}
        onClose={() => setIsCardBookOpen(false)}
        unlockedCards={progress.unlockedCards}
      />

      <AnalogyModal
        isOpen={isAnalogyOpen}
        onClose={() => setIsAnalogyOpen(false)}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
