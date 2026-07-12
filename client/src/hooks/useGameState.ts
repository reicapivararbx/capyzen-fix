import { useState, useRef, useCallback, useEffect } from 'react';
import type { GameState, Inventory } from '@/types/game';
import { trpc } from '@/lib/trpc';

/**
 * Hook customizado para gerenciar o estado do jogo
 * Centraliza toda a lógica de estado do CapyZen
 */
export function useGameState(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState);
  const stateRef = useRef<GameState>(state);
  const saveMutation = trpc.game.save.useMutation();
  const loadQuery = trpc.game.load.useQuery();

  // Sincronizar stateRef com state
  const syncStateRef = useCallback(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.coins > 0 || state.xp > 0 || state.totalScore > 0) {
        saveMutation.mutate(state);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [state, saveMutation]);

  // Load from backend on mount (migration from localStorage)
  useEffect(() => {
    if (loadQuery.isLoading) return;

    const migrationKey = 'capyzen_migration_done';
    const alreadyMigrated = localStorage.getItem(migrationKey);

    if (loadQuery.data) {
      setState(loadQuery.data);
      stateRef.current = loadQuery.data;
    } else if (!alreadyMigrated) {
      try {
        const saved = localStorage.getItem('capyzen_game');
        if (saved) {
          const localState = JSON.parse(saved);
          if (localState && typeof localState.coins === 'number') {
            saveMutation.mutate(localState);
            localStorage.setItem(migrationKey, 'true');
          }
        }
      } catch (e) {
        console.warn('[Migration] Failed to migrate localStorage:', e);
      }
    }
  }, [loadQuery.isLoading, loadQuery.data, saveMutation]);

  // Adicionar moedas
  const addCoins = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins + amount),
    }));
  }, []);

  // Adicionar XP
  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        totalXP: prev.totalXP + amount,
      };
    });
  }, []);

  // Atualizar fome
  const setHunger = useCallback((hunger: number) => {
    setState(prev => ({
      ...prev,
      hunger: Math.max(0, Math.min(100, hunger)),
    }));
  }, []);

  // Atualizar felicidade
  const setHappiness = useCallback((happiness: number) => {
    setState(prev => ({
      ...prev,
      happiness: Math.max(0, Math.min(100, happiness)),
    }));
  }, []);

  // Atualizar coco
  const setPoop = useCallback((poop: number) => {
    setState(prev => ({
      ...prev,
      poop: Math.max(0, Math.min(100, poop)),
    }));
  }, []);

  // Atualizar sus
  const setSus = useCallback((sus: number) => {
    setState(prev => ({
      ...prev,
      sus: Math.max(0, Math.min(100, sus)),
    }));
  }, []);

  // Adicionar item ao inventário
  const addInventoryItem = useCallback((itemName: keyof Inventory, amount: number = 1) => {
    setState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemName]: (prev.inventory[itemName] || 0) + amount,
      },
    }));
  }, []);

  // Remover item do inventário
  const removeInventoryItem = useCallback((itemName: keyof Inventory, amount: number = 1) => {
    setState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemName]: Math.max(0, (prev.inventory[itemName] || 0) - amount),
      },
    }));
  }, []);

  // Resetar estado
  const resetState = useCallback((newState: GameState) => {
    setState(newState);
  }, []);

  return {
    state,
    stateRef,
    setState,
    syncStateRef,
    loadQuery,
    addCoins,
    addXP,
    setHunger,
    setHappiness,
    setPoop,
    setSus,
    addInventoryItem,
    removeInventoryItem,
    resetState,
  };
}
