import { useState, useCallback, useEffect } from 'react';
import type { Achievement } from '@/types/game';

/**
 * Lista de todas as conquistas disponíveis no jogo
 */
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Exploração
  { id: 'first_explore', name: 'Primeira Exploração', description: 'Complete sua primeira exploração no jogo' },
  { id: 'area_forest', name: 'Explorador da Floresta', description: 'Descubra a área da Floresta' },
  { id: 'area_desert', name: 'Explorador do Deserto', description: 'Descubra a área do Deserto' },
  { id: 'area_mountain', name: 'Explorador da Montanha', description: 'Descubra a área da Montanha' },
  { id: 'area_ocean', name: 'Explorador do Oceano', description: 'Descubra a área do Oceano' },
  { id: 'area_space', name: 'Explorador do Espaço', description: 'Descubra a área do Espaço' },
  { id: 'all_areas', name: 'Mestre Explorador', description: 'Descubra todas as áreas do jogo' },

  // Compras e Loja
  { id: 'first_purchase', name: 'Primeira Compra', description: 'Realize sua primeira compra na loja' },
  { id: 'spend_1000', name: 'Gastador', description: 'Gaste 1.000 moedas na loja' },
  { id: 'spend_10000', name: 'Grande Gastador', description: 'Gaste 10.000 moedas na loja' },
  { id: 'spend_100000', name: 'Milionário Generoso', description: 'Gaste 100.000 moedas na loja' },
  { id: 'buy_10_items', name: 'Colecionador', description: 'Compre 10 itens diferentes' },
  { id: 'buy_50_items', name: 'Colecionador Veterano', description: 'Compre 50 itens diferentes' },

  // Evolução e Nível
  { id: 'first_level_up', name: 'Primeiro Nível', description: 'Alcance o nível 2' },
  { id: 'level_10', name: 'Veterano', description: 'Alcance o nível 10' },
  { id: 'level_25', name: 'Mestre', description: 'Alcance o nível 25' },
  { id: 'level_50', name: 'Lenda', description: 'Alcance o nível 50' },
  { id: 'level_100', name: 'Mítico', description: 'Alcance o nível 100' },

  // Moedas
  { id: 'earn_1000', name: 'Primeiro Milhar', description: 'Acumule 1.000 moedas' },
  { id: 'earn_10000', name: 'Rico', description: 'Acumule 10.000 moedas' },
  { id: 'earn_100000', name: 'Milionário', description: 'Acumule 100.000 moedas' },
  { id: 'earn_1000000', name: 'Bilionário', description: 'Acumule 1.000.000 de moedas' },

  // Jogo e Atividades
  { id: 'first_game', name: 'Primeiro Jogo', description: 'Jogue seu primeiro minigame' },
  { id: 'play_100_games', name: 'Viciado', description: 'Jogue 100 minigames' },
  { id: 'fnf_first_song', name: 'Primeira Música', description: 'Complete sua primeira música no FNF' },
  { id: 'fnf_perfect', name: 'Perfeito!', description: 'Complete uma música com combo perfeito no FNF' },
  { id: 'fnf_10_songs', name: 'DJ Capybara', description: 'Complete 10 músicas no FNF' },

  // Social
  { id: 'add_first_friend', name: 'Primeiro Amigo', description: 'Adicione seu primeiro amigo' },
  { id: 'add_10_friends', name: 'Popular', description: 'Adicione 10 amigos' },
  { id: 'send_first_message', name: 'Conversador', description: 'Envie sua primeira mensagem no chat' },
  { id: 'send_100_messages', name: 'Tagarela', description: 'Envie 100 mensagens no chat' },

  // Ranking
  { id: 'rank_top_10', name: 'Top 10', description: 'Alcance o top 10 do ranking global' },
  { id: 'rank_top_3', name: 'Podium', description: 'Alcance o top 3 do ranking global' },
  { id: 'rank_first', name: 'Campeão', description: 'Alcance o 1º lugar do ranking global' },

  // Conquistas
  { id: 'unlock_10_achievements', name: 'Colecionador de Conquistas', description: 'Desbloqueie 10 conquistas' },
  { id: 'unlock_25_achievements', name: 'Mestre das Conquistas', description: 'Desbloqueie 25 conquistas' },
  { id: 'unlock_all_achievements', name: 'Perfeccionista', description: 'Desbloqueie todas as conquistas' },

  // Personalização
  { id: 'first_color_change', name: 'Colorido', description: 'Mude a cor da sua capivara pela primeira vez' },
  { id: 'buy_first_hat', name: 'Chapeleiro', description: 'Compre seu primeiro chapéu' },
  { id: 'buy_first_outfit', name: 'Fashionista', description: 'Compre sua primeira roupa' },
  { id: 'full_outfit', name: 'Estilosa', description: 'Vista um conjunto completo (chapéu + roupa + acessório)' },

  // Eventos
  { id: 'event_participant', name: 'Participante', description: 'Participe de um evento especial' },
  { id: 'event_winner', name: 'Vencedor', description: 'Vença um evento especial' },
  { id: 'daily_login_7', name: 'Dedicado', description: 'Faça login por 7 dias seguidos' },
  { id: 'daily_login_30', name: 'Devoto', description: 'Faça login por 30 dias seguidos' },

  // Miscâneaos
  { id: 'first_pet', name: 'Carinhoso', description: 'Dê carinho à sua capivara' },
  { id: 'feed_100', name: 'Alimentador', description: 'Alimente sua capivara 100 vezes' },
  { id: 'work_50', name: 'Trabalhador', description: 'Trabalhe 50 vezes' },
  { id: 'poop_100', name: 'Sujo', description: 'Limpe a capivara 100 vezes' },
  { id: 'max_happiness', name: 'Feliz', description: 'Mantenha a felicidade em 100%' },
  { id: 'max_energy', name: 'Energético', description: 'Mantenha a energia em 100%' },
];

/**
 * Hook customizado para gerenciar achievements/conquistas
 */
export function useAchievements(currentUser: { username: string } | null) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (!currentUser) return [];
    try {
      const userKey = `capyzen_achievements_${currentUser.username}`;
      const saved = localStorage.getItem(userKey);
      const savedAchievements = saved ? JSON.parse(saved) : [];

      const merged = ACHIEVEMENT_DEFINITIONS.map(def => {
        const savedAchievement = savedAchievements.find((a: Achievement) => a.id === def.id);
        return savedAchievement || { ...def, unlocked: false };
      });
      return merged;
    } catch {
      return ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlocked: false }));
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

  // Check and unlock achievement based on conditions
  const checkAchievement = useCallback((achievementId: string, condition: boolean) => {
    if (condition) {
      unlockAchievement(achievementId);
    }
  }, [unlockAchievement]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

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
    checkAchievement,
    unlockedCount,
    totalCount,
    progress,
  };
}
