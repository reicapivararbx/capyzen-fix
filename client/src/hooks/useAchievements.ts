import { useState, useCallback, useEffect } from 'react';
import type { Achievement } from '@/types/game';

/**
 * Hook customizado para gerenciar achievements/conquistas
 */
export function useAchievements(currentUser: { username: string } | null) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (!currentUser) return [];
    try {
      const userKey = `capyzen_achievements_${currentUser.username}`;
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Desbloquear achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => {
      const existing = prev.find(a => a.id === achievementId);
      if (existing?.unlocked) return prev;

      return prev.map(a =>
        a.id === achievementId ? { ...a, unlocked: true } : a
      );
    });
  }, []);

  // Salvar achievements no localStorage
  useEffect(() => {
    if (!currentUser) return;

    try {
      const userKey = `capyzen_achievements_${currentUser.username}`;
      localStorage.setItem(userKey, JSON.stringify(achievements));
    } catch (e) {
      // Ignorar erro de quota
    }
  }, [achievements, currentUser]);

  return {
    achievements,
    setAchievements,
    unlockAchievement,
  };
}
