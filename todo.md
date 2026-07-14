# CapyZen Game - Status real do MVP

> Este documento reflete o estado real do projeto. Itens marcados como concluídos possuem código e testes no repositório.

---

## ✅ Concluído (com evidência)

### Game Core (FNF Engine — T2-T4)
- [x] FNF rhythm game (`client/src/pages/FNF.tsx`) — 5 músicas, 4 lanes (A/S/D/F), sistema de combo/health/score, suporte PC + Mobile (touch), achievements integrados
- [x] Canvas-based rendering com animação de notas e capivara

### Safe Lifecycle (T3+T5)
- [x] Save/Load com parse seguro (`client/src/lib/game-save.ts`) — `parseGameState`, `loadGameState`, `saveGameState`, `updateGameState`
- [x] Migração automática de legacy nested format (`flattenLegacySave`)
- [x] Safe parsing: nunca lança exceção em dados corrompidos
- [x] Testes de save/load (`client/src/lib/game-save.test.ts` — 18 testes)

### UI Responsiva (T6)
- [x] Layout responsivo com Tailwind CSS e gradientes pastéis
- [x] Componentes shadcn/ui integrados (dialog, card, button, etc.)
- [x] Tela de login (`client/src/components/LoginScreen.tsx`)
- [x] Capivara com crescimento por level (`client/src/components/GameCanvas.tsx`)
- [x] Barrinhas de status animadas (`client/src/components/StatsPanel.tsx`)
- [x] Painel admin com autenticação em 2 passos (`client/src/pages/Admin.tsx`)
- [x] Leaderboard com sorting e medals (`client/src/components/ImprovedLeaderboard.tsx` + backend tRPC)

### Admin / Shop Fix (T7)
- [x] Admin: senha + pergunta de segurança, fechar com senha
- [x] Loja com 1000 itens (400 Comida, 200 Roupa, 100 Acessório, 300 Boost) (`client/src/pages/Shop.tsx`, `shared/shop-items.json`)
- [x] 26 tipos de comida no inventário (`client/src/types/game.ts`)
- [x] Sistema de compra com verificação de moedas

### Game Logic (testada)
- [x] Sistema de level up (XP → level)
- [x] Sistema de comida (fome, poop)
- [x] Sistema de banheiro (reduz poop, recompensa coins)
- [x] Sistema de carinho (aumenta happiness, custa coins)
- [x] Sistema de trabalho (coins + XP, aumenta fome)
- [x] Sistema de score
- [x] Passive coin gain com cooldown de 10s
- [x] Auth (login/criação de usuário) — `client/src/pages/Home.tsx`, `server/routers.ts`

### Testes (T1 — parte)
- [x] 5 arquivos de teste: `client/src/pages/Home.test.ts` (36 testes), `client/src/lib/game-save.test.ts` (18 testes), `server/game-logic.test.ts` (37 testes), `server/input-validation.test.ts` (23 testes), `server/auth.logout.test.ts` (2 testes)
- [x] Testes de validação de entrada (login, criação de usuário)
- [x] Testes de lógica do jogo (level, food, bathroom, affection, work, score, status bars)
- [x] Testes de proteção de localStorage (QuotaExceededError, JSON.parse)
- [x] Testes de estado (initial state, bounds validation)
- [x] Testes de admin (validação de senha)
- [x] Testes de game over conditions
- [x] Testes de save/load/migration
- [x] Documento de testes manuais (`MANUAL_TESTING.md`)

---

## 🔄 Em andamento / Parcial

- **Achievements**: Hook `useAchievements.ts` existe com unlock + persistência, mas apenas 3 achievements definidos (no FNF.tsx). Sem definição central de 50+ conquistas.
- **Leaderboard**: Frontend + backend tRPC implementados, mas apenas score/level sorting. Sem histórico ou filtros avançados.
- **Error Boundary**: `ErrorBoundary.tsx` existe mas é genérico (sem fallback específico por componente).
- **Custom hooks**: `useAchievements`, `useGameState`, `useCooldown`, `useGameAuth` existem, mas `useGameState` ainda tem `any` e lógica de sync imperfeita.

### Refatoração e Otimização (parcial)
- [ ] Extrair funções grandes em componentes menores (Home.tsx com 346 linhas, FNF.tsx com 520)
- [ ] Adicionar tipos explícitos (reduzir 'any')
- [ ] Otimizar renderização do canvas
- [ ] Implementar lazy loading para modals
- [ ] Documentar funções principais com JSDoc

---

## 📋 Backlog (próximas rodadas)

### Multiplayer / Social
- Chat Global / Local / Privado (DM) / Time
- Amigos, Clãs/Guildas
- Histórico de mensagens, indicador de digitação, timestamps, notificações sonoras
- Filtro de palavrões, sistema de moderação
- Visitar casa de outros jogadores

### Economia Avançada
- Loja premium com gemas
- Leilão entre jogadores
- Banco, empréstimo, investimento
- Roubo, seguro, taxas
- Mercado negro

### Conteúdo do Jogo
- 8 jogos (atualmente só FNF implementado)
- 50+ conquistas (atualmente só 3 no FNF)
- Quests diárias/semanais
- Passe de batalha
- Eventos temáticos

### Mundo / Exploração
- Mapa explorável, biomas, NPCs
- Dungeons, chefes, tesouros
- Sistema de craft

### PvP
- Batalhas 1v1, em equipe
- Torneios
- Sistema de tipos (fogo, água, grama)

### Painel Admin (expansão)
- Autenticação em 2 etapas (completa)
- 100 comandos admin
- Interface do painel avançada

### Infra
- Backend-dependent features avançadas
- Leaderboard em tempo real
- Notificações push
- Cache e performance
