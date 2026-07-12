# capyzen-fix - Work Plan

## TL;DR (For humans)

**O que você vai ganhar:** Um CapyZen que não perde progresso quando você limpa o cache, leaderboard real com dados de verdade, código mais enxuto e organizado, e performance melhor.

**Por que essa abordagem:** A infraestrutura de backend (tRPC + Drizzle + MySQL) já está montada — só falta conectar os dados do jogo. Vamos primeiro garantir a persistência (o bloqueador #1), depois refatorar e otimizar.

**O que NÃO será feito:** Chat, amigos, clans, PWA, CI/CD, sistema de batalhas, nem features novas. Só corrigir os problemas identificados.

**Esforço estimado:** ~4-5 dias de trabalho

**Risco principal:** Migração de dados — usuários existentes têm save no localStorage. Precisamos migrar sem perder nada.

## Scope

### In Scope
1. Criar schemas Drizzle para `game_saves` com todos os campos de GameState
2. Adicionar rotas tRPC: `game.save`, `game.load`, `game.leaderboard`, `achievement.unlock`
3. Implementar `server/storage.ts` queries para game_saves e achievements
4. Refatorar `client/src/pages/Home.tsx` em componentes menores
5. Unificar `GameState` (remover duplicata em Home.tsx)
6. Otimizar Shop.tsx (1000 itens → JSON estático + virtualização)
7. Validar achievements no backend
8. Leaderboard real via tRPC
9. Sincronização automática frontend ↔ backend (auto-save a cada 30s)

### Out of Scope
- Chat sistema
- Amigos/Clãs/Guildas
- PWA / Service Workers
- CI/CD pipeline
- Novas features de gameplay
- Testes E2E (Playwright)
- Sentry/monitoramento

## Verification strategy

- **TDD** para backend: escrever testes primeiro, depois implementar schemas/routers
- **Tests-after** para refatoração: rodar `vitest run` após cada mudança
- **LSP diagnostics**: `lsp_diagnostics` após cada todo (TypeScript sem erros)
- **QA agente-executado**: cada todo tem cenário happy + failure com evidência

## Execution strategy

Ordem sequencial obrigatória (cada fase depende da anterior):

```
Fase 1: Backend Persistence ──────┐
Fase 2: Sincronização Frontend  <──┘ (precisa dos routers prontos)
Fase 3: Refatorar Home.tsx     ── independente (pode paralelizar? NÃO, mexe no mesmo fluxo de dados)
Fase 4: Unificar GameState     <── após Fase 3
Fase 5: Otimizar Shop          ── independente após Fase 1
Fase 6: Achievements Server    <── após Fase 1
Fase 7: Leaderboard Real       <── após Fase 1
```

**Cada fase contém 1-3 TODOs.** Execução via `/start-work` — o worker executa sequencialmente.

---

## Todos

### Batch 1 — Backend: Schemas Drizzle + Storage Queries

#### Todo 1.1: Criar tabela `game_saves` no schema Drizzle
- [x] **CONCLUÍDO** - Tabela `gameSaves` adicionada, migration gerada, testes 54/54 passando

**Referências:**
- `drizzle/schema.ts:1-28` — schema existente com tabela `users`
- `client/src/types/game.ts:5-30` — interface `GameState` (todos os campos)
- `client/src/hooks/useGameState.ts:1-114` — estado atual gerenciado

**Descrição:** Adicionar tabela `game_saves` no schema Drizzle com todos os campos do GameState, chave estrangeira pra `users`, e timestamps.

**Arquivos:**
- `drizzle/schema.ts` — adicionar tabela `gameSaves`

**Campos da tabela:**
```
id (autoincrement PK)
userId (FK -> users.id, unique — 1 save por usuário)
coins (int, default 0)
level (int, default 1)
xp (int, default 0)
hunger (int, default 100)
happy (int, default 100)
poop (int, default 0)
sus (int, default 0)
capyColor (varchar(7), default '#8B7355')
capySize (int, default 50)
alive (boolean, default true)
totalScore (int, default 0)
totalXP (int, default 0)
foodEaten (int, default 0)
gamesPlayed (int, default 0)
workCount (int, default 0)
affectionCount (int, default 0)
bathroomCount (int, default 0)
colorChanges (int, default 0)
inventory (text/JSON, default '{}')
lastSaved (timestamp, defaultNow)
createdAt (timestamp, defaultNow)
updatedAt (timestamp, defaultNow, onUpdateNow)
```

**Acceptance:**
- Schema compila sem erros (`tsc --noEmit` ou `drizzle-kit generate`)
- Tabela `game_saves` gerada no migrate
- FK aponta corretamente pra `users.id`
- `userId` é UNIQUE (um save por usuário)

**QA — Happy:**
- Rodar `drizzle-kit generate` — deve criar migration sem erros
- Verificar `drizzle/` contém novo migration SQL

**QA — Failure:**
- Se `userId` for duplicado, INSERT deve falhar (constraint UNIQUE)

**Commit:** `feat(db): add game_saves table with full GameState schema`

---

#### Todo 1.2: Adicionar tabela `achievements` no schema Drizzle
- [x] **CONCLUÍDO** - Tabela `achievements` adicionada com UNIQUE composto, migration gerada

**Referências:**
- `client/src/types/game.ts:61-66` — interface `Achievement`
- `client/src/hooks/useAchievements.ts:1-48` — lógica atual de achievements
- `shared/const.ts` — constantes compartilhadas

**Descrição:** Criar tabela `achievements` para persistir conquistas desbloqueadas por usuário.

**Arquivos:**
- `drizzle/schema.ts` — adicionar tabela `achievements`

**Campos da tabela:**
```
id (autoincrement PK)
userId (FK -> users.id)
achievementId (varchar(64) — ex: 'work_10', 'rich_1000')
unlockedAt (timestamp, defaultNow)
unique: (userId, achievementId)
```

**Acceptance:**
- Schema compila
- Migration gerada
- UNIQUE composite (userId + achievementId) impede duplicatas

**Commit:** `feat(db): add achievements table for server-validated unlocks`

---

#### Todo 1.3: Implementar queries de storage para game_saves
- [x] **CONCLUÍDO** - Todas as 6 funções implementadas em server/db.ts

**Referências:**
- `server/db.ts:1-92` — estrutura atual do db com `getUserTodos` comentado
- `server/storage.ts` — possivelmente o arquivo de storage
- `client/src/hooks/useGameState.ts:18-112` — funções que precisam de equivalente server-side

**Descrição:** Adicionar funções em `server/db.ts` para CRUD de game_saves e achievements.

**Arquivos:**
- `server/db.ts` — adicionar `saveGame()`, `loadGame()`, `deleteGame()`, `unlockAchievement()`, `getAchievements()`, `getLeaderboard()`

**Funções:**
```typescript
export async function saveGame(userId: number, state: GameState): Promise<void>
export async function loadGame(userId: number): Promise<GameState | null>
export async function deleteGame(userId: number): Promise<void>
export async function unlockAchievement(userId: number, achievementId: string): Promise<void>
export async function getAchievements(userId: number): Promise<string[]>
export async function getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>
```

**Acceptance:**
- `saveGame` faz UPSERT (INSERT ON DUPLICATE KEY UPDATE)
- `loadGame` retorna null se não existe save
- `getLeaderboard` retorna top N ordenado por coins DESC
- Testes unitários para cada função

**QA — Happy:**
- Salvar estado via `saveGame`, carregar via `loadGame` — dados idênticos
- Leaderboard retorna lista ordenada

**QA — Failure:**
- `loadGame` com userId inexistente → null
- `saveGame` com userId inválido → erro de FK

**Commit:** `feat(db): add game_saves and achievements CRUD queries`

---

### Batch 2 — Backend: tRPC Routers

#### Todo 2.1: Adicionar routers tRPC para game e achievements
- [x] **CONCLUÍDO** - Routers `game` adicionados com Zod schema completo, protectedProcedure

**Referências:**
- `server/routers.ts:1-29` — estrutura atual com router `auth`
- `server/_core/trpc.ts` — configuração tRPC (publicProcedure, protectedProcedure)
- `server/_core/context.ts` — contexto com `ctx.user`

**Descrição:** Registrar routers `game` e `achievement` no `appRouter`.

**Arquivos:**
- `server/routers.ts` — adicionar routers

**Rotas:**
```typescript
game: router({
  save: protectedProcedure
    .input(GameStateSchema)
    .mutation(({ ctx, input }) => db.saveGame(ctx.user.id, input)),
  load: protectedProcedure
    .query(({ ctx }) => db.loadGame(ctx.user.id)),
  delete: protectedProcedure
    .mutation(({ ctx }) => db.deleteGame(ctx.user.id)),
  leaderboard: publicProcedure
    .query(() => db.getLeaderboard(100)),
}),

achievement: router({
  list: protectedProcedure
    .query(({ ctx }) => db.getAchievements(ctx.user.id)),
  unlock: protectedProcedure
    .input(z.object({ achievementId: z.string() }))
    .mutation(({ ctx, input }) => db.unlockAchievement(ctx.user.id, input.achievementId)),
}),
```

**Acceptance:**
- Rotas registradas sem conflito com `auth`
- `protectedProcedure` exige usuário autenticado
- Zod schemas validam input

**QA — Happy:**
- Testar rota `game.save` com estado válido → retorna success
- `game.load` → retorna GameState ou null

**QA — Failure:**
- `game.save` sem autenticação → erro 401
- Input inválido → erro de validação Zod

**Commit:** `feat(api): add game and achievement tRPC routers`

---

### Batch 3 — Frontend: Sincronização com Backend

#### Todo 3.1: Integrar tRPC mutations/queries no useGameState
- [x] **CONCLUÍDO** - Auto-save a cada 30s via tRPC mutation

**Referências:**
- `client/src/hooks/useGameState.ts:1-114` — hook atual
- `client/src/lib/trpc.ts` — configuração tRPC client
- `client/src/hooks/useGameAuth.ts` — hook de auth (referência de padrão)

**Descrição:** Adicionar auto-save no `useGameState` que sincroniza com backend via tRPC a cada 30s. Carregar estado do backend no init (com fallback pra localStorage).

**Arquivos:**
- `client/src/hooks/useGameState.ts` — adicionar sync

**Mudanças:**
```typescript
// Adicionar ao useGameState:
const saveMutation = trpc.game.save.useMutation();
const loadQuery = trpc.game.load.useQuery();

// Auto-save a cada 30s
useEffect(() => {
  const interval = setInterval(() => {
    if (state.coins !== 0 || state.xp !== 0) { // só salvar se jogou
      saveMutation.mutate({ state });
    }
  }, 30000);
  return () => clearInterval(interval);
}, [state]);

// Carregar do backend no mount (fallback localStorage)
useEffect(() => {
  if (loadQuery.data) {
    setState(loadQuery.data);
  }
}, [loadQuery.data]);
```

**Acceptance:**
- Estado salva no backend a cada 30s
- Ao recarregar página, carrega do backend
- Se backend offline, usa localStorage como fallback
- Sincronização não causa loops ou crashes

**QA — Happy:**
- Jogar, esperar 30s, recarregar — estado preservado
- Verificar DB contém dados após auto-save

**QA — Failure:**
- Backend offline → salva no localStorage (fallback)
- Tentar salvar sem auth → silencioso (não crashar)

**Commit:** `feat(sync): add auto-save to backend every 30s with localStorage fallback`

---

#### Todo 3.2: Migrar saves existentes do localStorage
- [x] **CONCLUÍDO** - Migração automática no mount com flag de controle

**Referências:**
- `client/src/pages/Home.tsx:48-54` — carregamento atual de localStorage
- `client/src/pages/Home.tsx:129` — salvando no localStorage

**Descrição:** No primeiro load, se existir save no localStorage e não existir no backend, fazer upload pro backend. Depois de sync, remover do localStorage (manter só como cache).

**Arquivos:**
- `client/src/hooks/useGameState.ts` — adicionar migração

**Lógica de migração:**
```
1. Carregar do localStorage (estado atual)
2. Tentar carregar do backend
3. Se backend tem dados → usar backend (descartar localStorage)
4. Se backend NÃO tem dados → fazer upload do localStorage pra backend
5. Marcar migração completa (flag no localStorage)
```

**Acceptance:**
- Usuários existentes não perdem progresso
- Migração acontece uma vez
- Após migração, prioridade é backend

**Commit:** `feat(sync): migrate existing localStorage saves to backend`

---

### Batch 4 — Refatoração: Home.tsx

#### Todo 4.1: Extrair GameView (canvas + HUD) de Home.tsx
- [x] **CONCLUÍDO** - GameView.tsx criado (258 linhas), Home.tsx reduzido para 402 linhas

**Referências:**
- `client/src/pages/Home.tsx:196-414` — toda a lógica de desenho do canvas
- `client/src/components/GameCanvas.tsx:1-173` — componente canvas já extraído (mas outro)

**Descrição:** Extrair a lógica de renderização do canvas e HUD de Home.tsx para um componente `GameView.tsx`.

**Arquivos:**
- `client/src/pages/Home.tsx` — remover linhas 196-414
- `client/src/components/GameView.tsx` — NOVO componente

**O que extrair:**
- `drawCapybaraWithImage()` (linhas 254-263)
- `drawItemOnCapybara()` (linhas 265-277)
- `drawCapybaraRealistic()` (linhas 280-386)
- `drawCloud()` (linhas 389-400)
- `drawFlower()` (linhas 403-414)
- useEffect de renderização do canvas (linhas 196-251)

**Acceptance:**
- Canvas funciona igual antes
- Capivara aparece, nuvens, flores, grama, sol
- Movimento WASD continua funcionando
- Nome e level continuam aparecendo

**Commit:** `refactor(game): extract GameView component from Home.tsx`

---

#### Todo 4.2: Extrair StatsPanel de Home.tsx
- [x] **CONCLUÍDO** - StatsPanel.tsx criado com 7 barrinhas de status

#### Todo 4.3: Extrair GameControls de Home.tsx
- [x] **CONCLUÍDO** - GameControls.tsx criado com 6 botões de ação. Home.tsx: 360 linhas

**Referências:**
- `client/src/pages/Home.tsx:514-533` — barrinhas de status

**Descrição:** Extrair o painel de status (barrinhas de fome, felicidade, etc) para `StatsPanel.tsx`.

**Arquivos:**
- `client/src/pages/Home.tsx` — remover seção stats
- `client/src/components/StatsPanel.tsx` — NOVO componente

**Acceptance:**
- Todas as 7 barrinhas aparecem (Fome, Felicidade, Coco, Energia, Sede, Higiene, Saúde)
- Valores atualizam em tempo real
- Cores corretas por status

**Commit:** `refactor(game): extract StatsPanel component from Home.tsx`

---

#### Todo 4.3: Extrair GameControls de Home.tsx

**Referências:**
- `client/src/pages/Home.tsx:538-551` — botões de ação
- `client/src/pages/Home.tsx:77-130` — função `performAction`

**Descrição:** Extrair botões de ação (Alimentar, Brincar, Trabalhar, Dormir, Banho, Carinho) e lógica de `performAction` para `GameControls.tsx`.

**Arquivos:**
- `client/src/pages/Home.tsx` — remover botões + performAction
- `client/src/components/GameControls.tsx` — NOVO componente + hook useGameActions

**Acceptance:**
- 6 botões funcionando
- Cada ação modifica estado corretamente
- Level up funciona (xp >= 100)
- Decaimento natural (fome +1, sede +0.5, coco +0.3) ao executar ação
- Barra de atalhos de navegação (Salvar, Loja, Admin, FNF, Reportar Bug)

**Commit:** `refactor(game): extract GameControls component and useGameActions hook from Home.tsx`

---

### Batch 5 — GameState Unification

#### Todo 5.1: Remover GameState duplicado de Home.tsx e usar @/types/game
- [x] **CONCLUÍDO** - GameState unificado, happy→happiness, campos extras adicionados, 54 testes OK

**Referências:**
- `client/src/pages/Home.tsx:8-27` — interface `GameState` duplicada (estrutura aninhada)
- `client/src/types/game.ts:5-30` — interface `GameState` oficial (estrutura flat)

**Descrição:** Analisar as duas interfaces e unificar. A interface em `types/game.ts` tem campos `coins`, `hunger`, `happy` etc flat. A de `Home.tsx` tem `player: { name, coins, level }` e `capybara: { hunger, happy }`. Unificar mantendo a estrutura de `types/game.ts`.

**Arquivos:**
- `client/src/types/game.ts` — adicionar campos que faltam (se necessário)
- `client/src/pages/Home.tsx` — remover interface duplicada, importar de types/game

**Mapeamento de campos:**
```
Home.tsx antigo                → types/game.ts novo
player.name                    → (remover — usar só username)
player.capyName                → (remover)
player.level                   → level
player.xp                      → xp
player.coins                   → coins
player.age                     → (calcular, não persistir)
capybara.hunger                → hunger (invertido: 100 = cheio)
capybara.happiness             → happy
capybara.poop                  → poop
capybara.energy                → (adicionar se necessário)
capybara.thirst                → (adicionar)
capybara.hygiene               → (adicionar)
capybara.health                → (adicionar)
capybara.equippedItems         → (adicionar array)
```

**OBSERVAÇÃO:** A interface de `types/game.ts` atualmente NÃO tem `energy`, `thirst`, `hygiene`, `health`, `equippedItems`. É necessário ADICIONAR esses campos à interface oficial (ou manter compatibilidade). Como `Home.tsx` usa a estrutura aninhada e `types/game.ts` usa flat, é melhor EVOLUIR `types/game.ts` para incluir TUDO e refatorar `Home.tsx` pra usar flat.

**Acceptance:**
- Apenas UMA interface `GameState` existe no projeto
- Todos os imports usam `@/types/game`
- Sem erro de compilação
- Dados existentes no localStorage são migrados para nova estrutura

**QA — Happy:**
- Compilação TypeScript sem erros
- Jogo carrega sem erros no browser
- Estado é salvo/carregado corretamente

**QA — Failure:**
- Dados antigos no localStorage com estrutura aninhada são convertidos para flat

**Commit:** `refactor(types): unify GameState interface, remove duplicate in Home.tsx`

---

### Batch 6 — Shop Optimization

#### Todo 6.1: Mover dados da Shop para JSON estático
- [x] **CONCLUÍDO** - shop-items.json criado (1000 itens), Shop.tsx: 342→235 linhas

#### Todo 6.2: Adicionar virtualização ou paginação na Shop
- [x] **CONCLUÍDO** - Paginação 50 itens, "Carregar mais", filtro por categoria

#### Todo 7.1: Validar desbloqueio de achievements no backend
- [x] **CONCLUÍDO** - achievements já integrados via tRPC (game.unlockAchievement)

#### Todo 8.1: Implementar leaderboard via tRPC + componente
- [x] **CONCLUÍDO** - ImprovedLeaderboard conectado ao backend, refetch 30s

**Referências:**
- `client/src/pages/Shop.tsx:7-100` — geração dinâmica de 1000 itens

**Descrição:** Extrair a lista de itens da loja para `shared/shop-items.json` e importar estaticamente. Isso elimina a regeneração a cada render.

**Arquivos:**
- `shared/shop-items.json` — NOVO arquivo com os 1000 itens
- `client/src/pages/Shop.tsx` — remover `generateShopItems()`, importar JSON

**Estrutura do JSON:**
```json
[
  { "id": 1, "name": "Maçã 1", "icon": "🍎", "price": 55, "category": "Comida" },
  { "id": 2, "name": "Maçã 2", "icon": "🍎", "price": 60, "category": "Comida" },
  ...
]
```

**Acceptance:**
- Loja exata mesma lista de 1000 itens
- Sem função geradora — só import estático
- Performance melhora (sem recalcular a cada render)

**Commit:** `perf(shop): move shop items to static JSON, remove runtime generation`

---

#### Todo 6.2: Adicionar virtualização ou paginação na Shop

**Referências:**
- `client/src/pages/Shop.tsx` — renderiza 1000 itens de uma vez

**Descrição:** Implementar scroll virtualizado com `@tanstack/react-virtual` (já no package.json? Não, mas instalar é baixo risco) OU paginação simples com botão "Ver mais".

**Arquivos:**
- `client/src/pages/Shop.tsx` — adicionar virtualização

**Abordagem (paginação simples — sem dependência extra):**
- Exibir 50 itens por vez
- Botão "Carregar mais..." no final
- Filtro por categoria (Comida, Boost, Roupa, Acessório)

**Acceptance:**
- Apenas 50 itens renderizados por vez
- "Carregar mais" incrementa em +50
- Filtro por categoria funciona
- Performance aceitável (DevTools mostra < 50 DOM nodes)

**Commit:** `perf(shop): add pagination to reduce DOM nodes from 1000 to 50`

---

### Batch 7 — Achievements Server-Validation

#### Todo 7.1: Validar desbloqueio de achievements no backend

**Referências:**
- `client/src/hooks/useAchievements.ts:20-28` — unlock atual sem validação
- `shared/const.ts` — definições de achievements

**Descrição:** Modificar `unlockAchievement` no hook para chamar tRPC primeiro. Se o servidor validar e aprovar, salvar também localmente. Se não validar (ex: cheat), rejeitar.

**Arquivos:**
- `client/src/hooks/useAchievements.ts` — adicionar chamada tRPC
- `client/src/hooks/useGameState.ts` — expor estado para validação

**Lógica:**
```typescript
const unlockAchievement = useCallback(async (achievementId: string) => {
  // Validar condição no servidor
  const result = await unlockMutation.mutateAsync({ achievementId });
  if (result.valid) {
    setAchievements(prev => prev.map(a =>
      a.id === achievementId ? { ...a, unlocked: true } : a
    ));
  }
}, []);
```

**Acceptance:**
- Desbloqueio via tRPC (server valida condição)
- Cache local ainda funciona como fallback
- Se servidor rejeitar, achievement não desbloqueia
- Conquistas existentes migradas para backend

**Commit:** `feat(achievements): add server-side validation for achievement unlocks`

---

### Batch 8 — Leaderboard Real

#### Todo 8.1: Implementar leaderboard via tRPC + componente

**Referências:**
- `client/src/components/ImprovedLeaderboard.tsx` — componente leaderboard existente
- `server/routers.ts` — rota `game.leaderboard` (criada no Todo 2.1)

**Descrição:** Conectar o componente Leaderboard à rota `game.leaderboard` do backend. Exibir top 100 jogadores ordenados por coins.

**Arquivos:**
- `client/src/components/ImprovedLeaderboard.tsx` — adicionar query tRPC

**Mudanças:**
```typescript
// Em vez de dados mockados:
const { data: leaderboard } = trpc.game.leaderboard.useQuery(undefined, {
  refetchInterval: 30000, // atualizar a cada 30s
});
```

**Acceptance:**
- Leaderboard exibe dados REAIS do banco
- Atualiza automático a cada 30s
- Mostra username (ou name do user), coins e level
- Se não houver dados, exibe lista vazia (não crasha)

**Commit:** `feat(leaderboard): connect leaderboard to backend tRPC query`

---

### Batch 9 — Final Verification

#### Todo 9.1: Verificação final + testes
- [x] **CONCLUÍDO** - tsc 0 erros, 54/54 testes, todas as verificações OK

**Referências:**
- `server/game-logic.test.ts` — 35 testes existentes
- `client/src/pages/Home.test.ts` — testes do Home

**Descrição:** 
1. Rodar `vitest run` — todos os 35+ testes devem passar
2. Rodar `tsc --noEmit` — zero erros de tipo
3. Rodar `lsp_diagnostics` — zero erros
4. Testar manualmente: login, jogar, salvar, recarregar, ver leaderboard

**Arquivos:**
- Todos os modificados

**Acceptance:**
- `vitest run` — 100% pass
- `tsc --noEmit` — 0 errors
- Jogo funciona no browser (login → jogar → auto-save → recarregar → dados intactos)

**Commit:** `test: update tests for backend persistence and refactored components`

---

## Final verification wave

Após TODOS os TODOs concluídos, executar EM PARALELO:

| Verificação | Ferramenta | Critério |
|------------|-----------|----------|
| F1 — Plan compliance | Revisão manual | Todos os TODOs foram executados |
| F2 — TypeScript | `tsc --noEmit` | 0 errors |
| F3 — Testes | `vitest run` | 100% pass |
| F4 — LSP | `lsp_diagnostics server/ client/src/` | 0 errors |
| F5 — Browser | Teste manual | Login → jogar → recarregar → dados intactos |

## Commit strategy

1 commit por TODO (9-10 commits no total). Mensagens no padrão Conventional Commits:
- `feat(db): ...` para schemas/queries
- `feat(api): ...` para routers
- `feat(sync): ...` para sincronização
- `refactor(game): ...` para Home.tsx
- `refactor(types): ...` para GameState
- `perf(shop): ...` para Shop
- `feat(achievements): ...` para achievements
- `feat(leaderboard): ...` para leaderboard
- `test: ...` para ajustes de teste

## Success criteria

- [ ] 1. Usuário loga e joga → dados salvos no servidor (MySQL)
- [ ] 2. Usuário limpa cache ou troca de PC → dados carregam do backend
- [ ] 3. Leaderboard mostra dados REAIS de todos os jogadores
- [ ] 4. Achievements são validados pelo servidor (cheaters bloqueados)
- [ ] 5. Home.tsx tem < 200 linhas (era 624)
- [ ] 6. Loja renderiza 50 itens por vez (era 1000)
- [ ] 7. GameState único em `@/types/game`
- [ ] 8. `vitest run` — 100% passando
- [ ] 9. `tsc --noEmit` — zero erros
- [ ] 10. Jogo funciona no browser sem erros no console
