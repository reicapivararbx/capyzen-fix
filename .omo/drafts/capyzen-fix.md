# Draft: capyzen-fix

## Metadata
- **Intent**: CLEAR
- **Review required**: false
- **Status**: plan-written
- **Slug**: capyzen-fix
- **Pending action**: NONE — plan complete. Awaiting start/review decision.

## Topology (independent components)
1. **Backend Persistence Layer** - Drizzle schemas + tRPC routers + storage queries for game saves
2. **Home.tsx Refactoring** - decomposição do componente de 624 linhas em componentes menores
3. **GameState Unification** - remover interface duplicada em Home.tsx, usar apenas @/types/game
4. **Shop Performance** - virtualização/estaticização dos 1000 itens
5. **Achievements Server-Validation** - validar desbloqueio no backend
6. **Leaderboard Real** - leaderboard baseado em dados do servidor

## Exploration findings (já documentados em .omo/ANALISE_COMPLETA.md)
- Persistência 100% localStorage, backend não usado para dados de jogo
- Home.tsx: 624 linhas, 15+ useState, múltiplas responsabilidades
- GameState duplicado (types/game.ts vs Home.tsx:8-27) com estruturas diferentes
- Shop.tsx: 1000 itens gerados a cada render (performance)
- Achievements salvos apenas localStorage (sem validação)
- Backend tRPC + Drizzle completos mas inativos para features do jogo

## Decisions ledger
| # | Decision | Resolution | Evidence |
|---|----------|-----------|----------|
| 1 | Persistência DB | MySQL via Drizzle (já configurado) | drizzle/schema.ts, .env, drizzle.config.ts |
| 2 | ORM | Drizzle ORM (já instalado) | package.json: drizzle-orm |
| 3 | API pattern | tRPC (já configurado) | server/_core/trpc.ts, server/routers.ts |
| 4 | UI framework | Radix + Tailwind (já em uso) | client/src/components/ui/ |
| 5 | Test framework | Vitest (já configurado) | vitest.config.ts |
| 6 | Game state structure | Usar interface unificada de @/types/game | Eliminar duplicata |
| 7 | Shop data | Mover para JSON estático | Evitar regeneração a cada render |
| 8 | Achievements | Validar server-side mas cache localStorage | Padrão híbrido |

## Owner-decisions (genuine forks)
Nenhuma decisão precisa ser perguntada — o stack todo já está escolhido e documentado no código. A implementação segue os padrões existentes do projeto.

## Test strategy
- **TDD** para backend (schemas + routers) — seguir padrão dos 35 testes existentes
- **Tests-after** para refatoração de componentes — garantir que nada quebrou
- Agente-executado: QA automático com `lsp_diagnostics` + `vitest run` após cada todo

## Approach
6 fases sequenciais, cada uma com 1-3 todos, ordem de dependência respeitada:
1. Primeiro criar schemas + queries + routers (backend)
2. Depois refatorar Home.tsx em componentes
3. Unificar GameState
4. Otimizar Shop
5. Validar Achievements no server
6. Leaderboard real
