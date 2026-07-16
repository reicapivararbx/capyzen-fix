# CapyZen — FNF, estabilidade do jogo e MVP priorizado

## TL;DR

Entregar um MVP estável com: FNF usando setas direcionais reais, notas de toque e de sustentação, contagem regressiva antes das notas, áudio de acerto/erro e recompensa única de 1.000.000 de moedas após concluir as cinco músicas; idade nunca negativa, morte/game over funcional e layout sem sobreposição; Admin e Loja compatíveis com o `GameState` plano atual; documentação honesta em `todo.md` e `100_IDEIAS.md`; testes automatizados, QA real em desktop/mobile e commits atômicos.

O escopo **não** é implementar literalmente as 100 ideias. A decisão aprovada foi **MVP priorizado**: entregar os pedidos atuais, estabilizar os fluxos adjacentes e converter o restante em backlog verificável.

## Metadados de decisão

- Intento: `clear`
- Revisão de alta precisão: `false` (não solicitada)
- Aprovação: concedida pelo usuário
- Estratégia: corrigir primeiro o contrato compartilhado do save, depois gameplay e telas consumidoras, e só então atualizar documentação e validar tudo.
- Restrição: o executor deve preservar alterações locais não relacionadas e nunca usar reset/checkout destrutivo.

## Resultado esperado

1. O FNF começa com uma contagem regressiva de 3 segundos e uma pequena janela vazia antes da primeira nota.
2. As notas são glifos/setas direcionais reconhecíveis, não círculos.
3. Existem notas normais e notas de sustentação; estas exigem pressionar e manter a tecla/toque da pista até o fim.
4. Acerto, erro, início de sustain e conclusão de sustain têm feedback visual; acerto e erro têm sons curtos gerados localmente, sem depender de arquivos ou rede.
5. A conclusão das cinco músicas concede **exatamente uma vez por campanha/save** a recompensa de `1_000_000` moedas.
6. A idade é sempre um inteiro não negativo, inclusive com timestamp ausente, inválido ou no futuro.
7. A capivara morre quando a saúde chega a zero; o loop para, ações ficam bloqueadas e aparece um game over com opção explícita para iniciar um novo jogo.
8. Botões, canvas, painel de status, modais e popup não se sobrepõem em desktop ou mobile.
9. Admin, Loja e FNF leem/escrevem o mesmo formato plano de `GameState` usado por Home.
10. `todo.md` e `100_IDEIAS.md` passam a representar o estado real: entregue, parcialmente entregue ou backlog.

## Escopo

### Incluído

- Mecânica e renderização do FNF em PC e mobile.
- Persistência local da progressão/recompensa do FNF no save existente.
- Normalização/migração defensiva do save legado.
- Regra de idade e game over.
- Reorganização responsiva dos controles da Home.
- Correção do Admin e da Loja para o schema plano.
- Testes unitários de lógica e testes de integração de persistência/localStorage.
- QA visual e funcional via Playwright em `/matteo/`, `/matteo/fnf`, `/matteo/admin` e `/matteo/loja`.
- Atualização de `todo.md` e `100_IDEIAS.md`.
- Commits atômicos locais; não fazer push sem nova autorização.

### Excluído

- Multiplayer real, salas, chat, clãs, leilão, banco, moderação e demais sistemas grandes das 100 ideias.
- Upload ou licenciamento de músicas completas.
- Reescrita do backend ou migração total para persistência remota.
- Mudança das credenciais/regras atuais do Admin, exceto o necessário para restaurar funcionamento e persistir autenticação da sessão conforme o comportamento já documentado.
- Redesign integral da marca ou de todas as páginas.

## Decisões de implementação

### Contrato único de save

- `GameState` em `client/src/types/game.ts` é a fonte de verdade. O formato canônico é **plano**: `coins`, `level`, `xp`, `equippedItems`, etc.; não criar nem continuar usando `player.coins` ou `capybara.equippedItems`.
- Adicionar ao contrato uma progressão FNF tipada, com defaults e migração para saves antigos. Forma recomendada:
  - `fnf.completedSongIds: string[]`
  - `fnf.millionRewardClaimed: boolean`
- Implementar um módulo puro de persistência/normalização (por exemplo `client/src/lib/game-save.ts`) com funções para:
  - criar o estado inicial;
  - parsear `unknown` vindo do localStorage;
  - preencher campos ausentes;
  - corrigir números inválidos/negativos onde o domínio não permite;
  - migrar o formato legado aninhado (`player`, `capybara`) para o plano;
  - carregar, salvar e atualizar atomicamente `capyzen_game`.
- `Home`, `FNF`, `Admin` e `Shop` devem usar esse módulo; não repetir `JSON.parse` e mutações ad hoc.
- Não sobrescrever o save inteiro com uma cópia obsoleta: atualizações de recompensa/compra/admin devem carregar o valor mais recente, produzir novo estado e persistir uma vez.

### FNF

- Extrair lógica pura para um módulo testável (por exemplo `client/src/features/fnf/engine.ts`) e deixar `FNF.tsx` focado em composição, input, canvas e estados de tela.
- Modelar notas como união discriminada:
  - `tap`: instante, pista, estado de julgamento;
  - `hold`: início, duração, pista, estado de início/conclusão/ruptura.
- Usar quatro pistas com direções estáveis: esquerda, baixo, cima, direita; teclado aceita setas e WASD, e os quatro botões mobile usam o mesmo dispatcher.
- Começo da música:
  - estado `countdown` por 3 segundos (`3`, `2`, `1`, `VAI!`);
  - relógio musical começa depois da contagem;
  - primeira nota agendada pelo menos 1 segundo após o início do relógio, evitando aparecer instantaneamente.
- Julgamento recomendado e determinístico:
  - perfect: `<= 100 ms`;
  - good: `<= 180 ms`;
  - miss após `> 250 ms`;
  - números podem ser constantes nomeadas e testadas, não mágicos espalhados.
- Hold:
  - acertar a cabeça dentro da janela inicia a sustentação;
  - `keydown`/`pointerdown` marca pista segurada e `keyup`/`pointerup` libera;
  - completar pelo menos 90% da duração conta como concluído;
  - liberar antes disso quebra combo e aplica dano uma única vez;
  - ignorar repetição automática de `keydown` para não pontuar várias vezes.
- Renderização:
  - desenhar setas via `Path2D`/polígono ou glifo direcional centralizado, com rotação por pista;
  - receptores também são setas, com estado neutro/pressionado;
  - hold é cabeça em forma de seta + cauda/haste com comprimento proporcional à duração;
  - usar cor + forma/ícone, nunca apenas cor, para distinguir estados.
- Áudio:
  - criar um único `AudioContext` após gesto do usuário;
  - sintetizar bips curtos distintos para acerto e erro com oscillator/gain;
  - não criar contexto por nota; fechar/limpar no unmount;
  - falha ou bloqueio de áudio não pode impedir o jogo.
- Campanha/recompensa:
  - cada música concluída entra em `completedSongIds` sem duplicatas;
  - quando as cinco IDs estiverem presentes e `millionRewardClaimed === false`, adicionar `1_000_000` a `coins` e marcar o flag na mesma atualização atômica;
  - repetir música, recarregar página ou remontar componente não concede novamente;
  - substituir o acesso quebrado `parsed.player.coins`.

### Idade, saúde e game over

- Extrair funções puras (por exemplo `calculateAgeMinutes`, `applyLifeTick`, `isGameOver`) para teste.
- `calculateAgeMinutes` retorna `0` para timestamp ausente/inválido/futuro e `Math.floor(deltaMs / 60_000)` para timestamp válido passado.
- No carregamento, normalizar qualquer `age < 0`, `NaN` ou valor não inteiro.
- O tick deve degradar stats em uma cadência razoável e separada da animação; o intervalo atual de 50 ms não deve persistir em localStorage 20 vezes por segundo. Usar tick de simulação/persistência desacoplado (por exemplo 500–1000 ms), mantendo canvas/input responsivos.
- Definir dano à saúde quando necessidades críticas permanecem em estado ruim; clamp de todos os stats em `[0, 100]`.
- Quando `health <= 0`, persistir `alive: false`, cancelar o loop e bloquear ações/movimento.
- Mostrar modal/painel acessível de game over com nome/idade/score e botão “Novo jogo”. O botão limpa apenas chaves do save/início relacionadas ao jogo, preservando preferências como tema e popup dispensado, e volta ao formulário inicial.

### Layout responsivo

- Criar `DESIGN.md` antes de alterar UI, documentando o sistema visual existente: gradientes pastéis, contraste, espaçamento, estados de botão, breakpoints e regras do canvas/FNF.
- Na Home, usar fluxo normal e grid responsivo em vez de coordenadas/fixed para controles principais:
  - header/nav em linha com wrap;
  - desktop: canvas + StatsPanel em colunas;
  - mobile: uma coluna, canvas responsivo e controles abaixo;
  - ações primárias em grade com alvos de toque de pelo menos 44×44 px.
- O popup de WhatsApp deve respeitar safe area, não cobrir controles e poder ser fechado por teclado.
- FNF mobile deve impedir scroll/zoom acidental apenas dentro da área de controles, não na página inteira.

### Admin e Loja

- Admin:
  - substituir `game.player.coins`, `game.player.level` e `game.player.xp` pelos campos canônicos;
  - carregar estado normalizado; mensagens de erro visíveis quando não há save/corrompido;
  - corrigir semântica dos stats: no modelo atual `hunger`/`thirst` crescem como necessidade; “maximizar stats” deve restaurar `hunger`, `thirst` e `poop` para `0`, e `happiness`, `energy`, `hygiene`, `health` para `100`;
  - manter a autenticação apenas durante a sessão da aba via `sessionStorage`, se esse comportamento ainda não existir, e limpar explicitamente em “Fechar com senha”.
- Loja:
  - substituir formato aninhado pelo plano (`coins`, `equippedItems`);
  - impedir compra sem saldo e duplicação acidental de item equipável;
  - refletir saldo atualizado imediatamente e persistir via módulo compartilhado;
  - não ampliar o escopo para mercado premium/leilão.

### Documentação MVP

- `todo.md` deve ser reescrito como documento operacional curto:
  - “Entregue nesta rodada” com evidências/testes;
  - “Backlog MVP” somente para trabalho realmente pendente;
  - remover alegações antigas não verificadas, duplicatas e itens marcados como concluídos que o código contradiz.
- `100_IDEIAS.md` mantém as 100 ideias, mas ganha legenda de status (`Entregue`, `Parcial`, `Backlog`, `Fora do MVP`) e uma seção inicial “MVP priorizado”.
- Marcar como entregues/parciais somente recursos comprovados no código. Não transformar backlog em checkbox concluído por desejo.

## Estratégia de verificação

- TDD para engine do FNF, normalização de save, idade e life tick.
- Tests-after para composição de páginas e persistência integrada.
- Ajustar `vitest.config.ts` para incluir testes do cliente que hoje ficam fora do padrão; usar ambiente `jsdom` apenas nos testes que precisam DOM/localStorage, mantendo lógica pura em `node`.
- Gates obrigatórios:
  - `pnpm test`
  - `pnpm check`
  - `pnpm build`
  - diagnósticos LSP sem erros nos arquivos alterados
  - Playwright em desktop e viewport mobile, com console sem erros.
- Para UI alterada, executar também o fluxo `shared/visual-qa`; guardar screenshots/evidências temporárias fora do commit.

## Estratégia de execução

### Wave 1 — fundação e lógica pura

Executar T1–T3 em ordem; T2 e T3 podem avançar em paralelo depois que T1 definir os contratos.

### Wave 2 — integração das páginas

Executar T4–T7. T4 depende de T2; T5–T7 dependem de T1/T3 e podem ser paralelos com ownership de arquivos separado.

### Wave 3 — documentação, QA e commits

Executar T8–T10 após todas as integrações.

## Todos executáveis

### - [ ] T1. Unificar e migrar o contrato do save

**Arquivos:** `client/src/types/game.ts`, novo `client/src/lib/game-save.ts`, novo teste `client/src/lib/game-save.test.ts`, `vitest.config.ts`.

**Implementação + teste:**
- Tipar o progresso FNF e incorporá-lo ao `GameState`.
- Criar defaults, parser/normalizador e operações load/save/update.
- Migrar saves planos incompletos e o legado aninhado; tratar JSON inválido sem crash.
- Adicionar testes para save ausente, inválido, plano, legado, campos faltantes, moedas preservadas e recompensa já reivindicada.

**Aceite:** todos os consumidores podem receber um `GameState` completo sem `any`; nenhuma função pública aceita JSON já confiável sem parse/narrowing; migração nunca reduz moedas nem apaga itens válidos.

**QA feliz:** inserir save legado no localStorage, recarregar, confirmar nome/moedas/itens preservados. Evidência: teste Vitest + snapshot do Application/localStorage.

**QA falha:** inserir JSON truncado e abrir Home/Admin/Loja; app mostra estado inicial/erro controlado, sem tela branca. Evidência: console Playwright sem exceção não tratada.

**Commit:** `refactor(save): unify and migrate game state persistence`

### - [ ] T2. Implementar engine determinística do FNF

**Arquivos:** novo `client/src/features/fnf/engine.ts`, novo `client/src/features/fnf/engine.test.ts`.

**Implementação + teste:**
- Definir tipos tap/hold, pistas, chart, relógio, janelas de julgamento e reducer/transições.
- Gerar chart determinístico por música com primeira nota após o delay e proporção controlada de holds.
- Testar tap perfect/good/miss, tecla errada, key repeat, hold completo, hold abandonado, health zero, fim da música e ausência de dupla pontuação.

**Aceite:** dado o mesmo chart e sequência de eventos, o resultado é idêntico; cada nota produz no máximo um julgamento terminal; duração da cauda nunca é negativa.

**QA feliz:** simulação unitária completa uma música com score/combo esperados.

**QA falha:** soltar hold antes de 90% causa um único miss e um único dano.

**Commit:** `feat(fnf): add deterministic tap and hold note engine`

### - [ ] T3. Implementar lógica pura de vida, idade e game over

**Arquivos:** novo `client/src/features/game/life.ts`, novo `client/src/features/game/life.test.ts`.

**Implementação + teste:**
- Implementar cálculo defensivo de idade, clamps, tick de necessidades/dano e transição alive→dead.
- Cobrir timestamp passado, futuro, inválido, virada de minuto, stats nos limites e morte idempotente.

**Aceite:** idade nunca é negativa/NaN; stats nunca saem de `[0,100]`; estado morto não continua degradando/pontuando.

**QA feliz:** tick com necessidades normais mantém capivara viva e idade correta.

**QA falha:** saúde em 0 retorna `alive: false` e ticks seguintes não ressuscitam.

**Commit:** `fix(game): make age and game over transitions safe`

### - [ ] T4. Reconstruir a experiência FNF em PC e mobile

**Arquivos:** `client/src/pages/FNF.tsx`, componentes novos sob `client/src/features/fnf/` se necessários, `DESIGN.md`.

**Referências:** engine de T2; persistência de T1; rota em `client/src/App.tsx`; canvas atual em `FNF.tsx` linhas de renderização de pistas/notas; input atual teclado/mobile.

**Implementação + teste:**
- Integrar estados seleção→countdown→playing→won/lost.
- Renderizar receptores/setas/tails, feedback de julgamento e progresso.
- Implementar down/up para teclado e pointer com cleanup completo.
- Adicionar AudioContext único com bips distintos e fallback silencioso.
- Persistir músicas e conceder 1M uma vez após a quinta.

**Aceite:** nenhuma nota aparece durante countdown; primeira nota respeita delay; setas são visualmente direcionais; hold funciona nos dois dispositivos; cinco músicas dão 1M uma vez; replay/reload não duplica.

**QA feliz:** Playwright desktop completa cenário reduzido/controlado das cinco músicas e observa saldo +1M e flag persistido; mobile mantém um hold via pointer e conclui.

**QA falha:** perder todas as notas chega a game over sem timers/sons continuarem; áudio bloqueado não quebra input.

**Evidência:** screenshots desktop/mobile, vídeo curto ou trace de sustain, console e localStorage.

**Commit:** `feat(fnf): ship directional hold notes audio and campaign reward`

### - [ ] T5. Integrar idade, morte e novo jogo na Home

**Arquivos:** `client/src/pages/Home.tsx`, `client/src/components/GameControls.tsx`, possível novo `client/src/components/GameOverDialog.tsx`, testes de integração.

**Implementação + teste:**
- Trocar cálculo inline pela lógica T3 e persistência T1.
- Desacoplar tick/persistência do frame visual.
- Bloquear teclado e ações quando morto.
- Exibir game over acessível e reset seletivo.
- Testar idade futura/inválida e fluxo vivo→morto→novo jogo.

**Aceite:** não existe idade -1; saúde 0 apresenta game over; loop é cancelado; “Novo jogo” volta ao formulário e não remove preferências alheias.

**QA feliz:** manipular saúde para 0, aguardar tick, confirmar modal e iniciar novo jogo.

**QA falha:** save com `capyzen_start` futuro abre com idade 0 e permanece jogável.

**Commit:** `fix(home): add safe lifecycle and recoverable game over`

### - [ ] T6. Corrigir layout responsivo e sobreposições

**Arquivos:** `DESIGN.md`, `client/src/pages/Home.tsx`, `client/src/components/GameControls.tsx`, `client/src/components/StatsPanel.tsx`, estilos estritamente necessários.

**Implementação + teste:**
- Documentar tokens/regras antes de mexer na UI.
- Reorganizar header, canvas, painel e ações com grid/flow responsivo.
- Garantir alvos de toque, foco visível, labels e safe area do popup.

**Aceite:** sem overflow horizontal ou controles encobertos em 360×800, 768×1024 e 1440×900; navegação completa por teclado; canvas não deforma.

**QA feliz:** screenshots nas três viewports mostram hierarquia e espaçamento consistentes.

**QA falha:** popup aberto no menor viewport não cobre ação primária e pode ser fechado por teclado.

**Commit:** `fix(ui): prevent home controls and overlays from colliding`

### - [ ] T7. Restaurar Admin e Loja sobre o schema canônico

**Arquivos:** `client/src/pages/Admin.tsx`, `client/src/pages/Shop.tsx`, testes de integração/localStorage.

**Implementação + teste:**
- Remover todos os acessos `player.*`/`capybara.*`.
- Usar load/update compartilhado.
- Corrigir give coins, level up, max stats, saldo/compra/equipamento e estados sem save.
- Persistir autenticação do Admin apenas na sessão da aba e honrar fechamento protegido.

**Aceite:** Admin adiciona moedas e nível sem erro; max stats usa semântica correta; Loja compra com saldo, rejeita sem saldo e atualiza Home após reload; nenhum `any` novo.

**QA feliz:** criar save, autenticar Admin, adicionar moedas, comprar item na Loja e confirmar item na capivara/Home.

**QA falha:** acessar Admin/Loja sem save ou com save corrompido mostra orientação, não tela branca.

**Commit:** `fix(admin-shop): use canonical game state for mutations`

### - [ ] T8. Tornar os documentos verdadeiros e priorizados

**Arquivos:** `todo.md`, `100_IDEIAS.md`.

**Implementação + teste:**
- Consolidar histórico ruidoso do TODO em entregue/backlog com links para testes/arquivos.
- Adicionar matriz/status do MVP às 100 ideias sem declarar sistemas inexistentes como concluídos.
- Registrar explicitamente que sistemas multiplayer/social/economia avançada ficam fora desta entrega.

**Aceite:** cada item marcado entregue possui evidência no repositório; nenhuma pendência desta rodada permanece marcada concluída antes dos gates.

**QA feliz:** revisão cruzada encontra código/teste para cada item entregue.

**QA falha:** qualquer item sem evidência é rebaixado para Parcial/Backlog.

**Commit:** `docs: reconcile MVP status and gameplay backlog`

### - [ ] T9. Executar gates automatizados e corrigir regressões

**Arquivos:** somente os necessários para corrigir falhas causadas pelo escopo.

**Passos:**
- Rodar `pnpm test`, `pnpm check`, `pnpm build`.
- Rodar diagnósticos LSP em todos os arquivos alterados.
- Buscar e eliminar usos restantes de `game.player`, `gameState.player`, `parsed.player` e `.capybara.` nos fluxos do save.
- Verificar timers, event listeners e AudioContext no mount/unmount.

**Aceite:** todos os comandos saem com código 0; zero diagnóstico LSP de erro; zero acesso legado relevante.

**QA falha:** se algum teste antigo codifica comportamento incorreto, atualizar o teste junto com justificativa no commit — nunca apenas desabilitá-lo.

**Commit:** usar `fixup!` no commit proprietário da regressão e autosquash antes da entrega; não criar commit genérico “fix tests”.

### - [ ] T10. QA real, revisão final e preparação do histórico

**Ferramentas:** `shared/visual-qa`, Playwright obrigatório, `shared/review-work` antes do handoff; `shared/git-master` para commits.

**Cenários manuais mínimos:**
1. Home nova → jogar → idade 0+ → ações sem sobreposição.
2. Timestamp futuro/inválido → idade 0.
3. Saúde 0 → game over → novo jogo.
4. FNF PC → countdown → tap → hold → hit/miss sonoros → vitória/derrota.
5. FNF mobile → quatro botões, pointer hold e release.
6. Cinco músicas → +1M uma vez → reload/replay sem segunda recompensa.
7. Admin → autenticar → moedas/nível/max stats → fechar sessão.
8. Loja → saldo insuficiente e compra válida → item persistido.

**Aceite:** console sem erros, nenhum request 4xx/5xx inesperado, screenshots aprovadas nas viewports, e os quatro revisores finais aprovam.

**Commit/histórico:** confirmar commits atômicos acima, executar autosquash apenas dos fixups e apresentar `git status`, `git log --oneline` e diff-stat. Não incluir `.playwright-mcp`, logs, screenshots temporários ou segredos. Não fazer push.

## Final verification wave

Após T1–T10, disparar em paralelo e exigir aprovação de todos:

- [ ] **F1 — Conformidade:** comparar cada resultado/aceite deste plano com o diff e evidências.
- [ ] **F2 — Qualidade:** revisar tipos, duplicação, timers, listeners, áudio, persistência atômica e idempotência da recompensa.
- [ ] **F3 — QA real:** repetir os oito cenários Playwright em desktop/mobile e revisar screenshots.
- [ ] **F4 — Fidelidade de escopo:** garantir que as 100 ideias não foram simuladas/documentadas como prontas e que não houve backend/redesign não solicitado.

Se qualquer frente reprovar, corrigir no commit proprietário, repetir os gates afetados e rodar novamente a frente reprovada. Só declarar conclusão depois de todas aprovarem e o usuário aceitar o handoff.

## Estratégia de commits

Sequência recomendada:

1. `refactor(save): unify and migrate game state persistence`
2. `feat(fnf): add deterministic tap and hold note engine`
3. `fix(game): make age and game over transitions safe`
4. `feat(fnf): ship directional hold notes audio and campaign reward`
5. `fix(home): add safe lifecycle and recoverable game over`
6. `fix(ui): prevent home controls and overlays from colliding`
7. `fix(admin-shop): use canonical game state for mutations`
8. `docs: reconcile MVP status and gameplay backlog`

Cada commit deve conter seus testes. Se o usuário exigir literalmente um único commit no handoff, pedir confirmação antes de squash; o pedido “depois commit” é atendido melhor por histórico atômico e auditável.

## Critérios finais de sucesso

- Setas não são círculos e cada direção é inequívoca.
- Tap e hold funcionam em teclado e touch, com delay inicial e cleanup correto.
- Sons de hit/miss funcionam após gesto e falha de áudio é tolerada.
- A quinta música concede exatamente 1.000.000 uma única vez.
- Idade jamais fica negativa.
- Game over é alcançável, persistido, bloqueia ações e permite novo jogo.
- Layout não sobrepõe controles nas viewports definidas.
- Admin e Loja não usam schema aninhado legado.
- TODO/100 ideias refletem evidências e backlog real.
- Testes, tipos, build, LSP, QA visual e revisão final passam.
- Commits são atômicos, sem artefatos, segredos ou push.
