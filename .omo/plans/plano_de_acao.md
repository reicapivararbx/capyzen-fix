# Plano de Ação — FNF CapyZen baseado no Funkin original

## Objetivo

Refatorar a experiência FNF do CapyZen para alinhar com a engine original do Friday Night Funkin' (FunkinCrew/Funkin), corrigindo bugs e adicionando mecânicas faltantes.

**Repo de referência:** https://github.com/FunkinCrew/Funkin  
**Código original relevante:** `source/funkin/play/notes/` (Haxe)

---

## O que está errado / faltando

### 1. Cores das notas erradas
**Atual:** `['#ef4444', '#3b82f6', '#22c55e', '#eab308']` (vermelho, azul, verde, amarelo)  
**Original:** Roxo (←), Azul (↓), Verde (↑), Vermelho (→)

**Arquivos:** `client/src/pages/FNF.tsx` linha 27  
**Ação:** Trocar `LANE_COLORS`.

---

### 2. Receptor (Strumline) sem estados visuais
**Atual:** Um retângulo estático com borda.  
**Original:** 4 estados animados: `static → press → confirm → confirm-hold`

**Arquivos:** `client/src/pages/FNF.tsx` linhas 320-334 (drawCanvas)  
**Ação:** Implementar feedback visual no receptor:
- `static`: cor normal
- `press`: brilho intenso / escala maior
- `confirm`: glow + animação de confirmação
- `confirm-hold`: mantém o glow enquanto segura a nota de sustentação

Usar `opacidade + escala + cor` já que não temos spritesheet.

---

### 3. Sustain Trail (cauda de hold) muito simplista
**Atual:** `ctx.fillRect()` simples com alpha 0.5  
**Original:** `SustainTrail.hx` com `drawTriangles()`, UV mapping, end cap, clipping conforme o progresso da música

**Arquivos:** `client/src/pages/FNF.tsx` linhas 345-357  
**Ação:** 
- A cauda deve "encolher" conforme a nota é segurada (clipping da parte já tocada)
- Adicionar um "end cap" no final da cauda (um arredondado/gorro)
- A cauda começa cheia e vai diminuindo de cima pra baixo conforme o tempo passa
- Usar `Path2D` para um formato mais refinado (bordas arredondadas, gradiente)

---

### 4. Julgamento (judgment) com timing windows erradas
**Atual:** perfect ≤80ms, good ≤150ms, miss >150ms  
**Original:** usa janelas configuráveis por dificuldade, geralmente:
- Sick/Perfect: ≤45ms (ou 22.5ms em hard)
- Good: ≤90ms (ou 67.5ms em hard)  
- Bad: ≤135ms  
- Miss: >135ms

**Arquivo:** `client/src/features/fnf/engine.ts` linhas 83-88  
**Ação:** Ajustar `judgeNote()` para janelas mais fiéis. Adicionar rating "bad" entre good e miss.

---

### 5. Game Over sem transição
**Atual:** Quando `health <= 0`, o `death` event chama `handleSongClear` direto, resultando em tela de resultado.  
**Original:** Quando health chega a 0, toca animação de morte (personagem cai, tela escurece), SÓ DEPOIS mostra resultado.

**Arquivos:** `client/src/pages/FNF.tsx` linha 266-268, `client/src/pages/FNF.tsx` linha 412-414  
**Ação:** 
- Quando `death` disparar: parar a música, mostrar animação de "derrota" (ex: tela vermelha fade, texto "GAME OVER" crescendo, wait 2s)
- Só depois mostrar a tela de resultado
- No loop, quando `health <= 0`: parar de processar notas mas continuar renderizando a tela por alguns frames (não cortar abruptamente)

---

### 6. Chart gerado aleatoriamente (sem BPM)
**Atual:** `generateChart()` usa RNG, duração fixa de 30s, notas espaçadas 400-1000ms  
**Original:** Charts são arquivos .json com BPM, beats, steps, tempos, seções

**Arquivo:** `client/src/features/fnf/engine.ts` linhas 46-68  
**Ação:** 
- Adicionar conceito de BPM ao chart
- Gerar notas baseadas em beats (não ms aleatório)
- Músicas com durações variadas (30s, 45s, 60s, 75s, 90s)
- Adicionar variedade de densidade (seções mais intensas, pausas)

---

### 7. Combo/Score sem precisão
**Atual:** Score baseado em perfect=300, good=100, miss=0 com bonus de combo  
**Original:** Sistema mais complexo com:
- Rating final (S, A, B, C, D, F) baseado em accuracy
- Accuracy = soma dos ratings / total notas
- NPS (notas por segundo)

**Ação:** Adicionar cálculo de accuracy na tela de resultado, e rating letter.

---

### 8. Falta feedback de "hold complete" no receptor
**Atual:** Quando um hold termina com sucesso, não há feedback visual no receptor.  
**Original:** O receptor mostra `confirm` enquanto segura, e volta a `static` quando solta.

**Ação:** Quando um `hold_complete` ou `hold_dropped` acontecer, o receptor deve piscar/pressionar momentaneamente.

---

### 9. Timer de countdown não sincronizado com o início da música
**Atual:** Countdown é 3-2-1-GO com intervalo de 800ms. Depois do GO, a engine começa com `songPositionMs = 0` e LEAD_IN_MS = 2000ms antes da primeira nota.  
**Original:** Countdown alinhado com BPM (4 beats de introdução), primeira nota no beat 0 do chart.

**Ação:** Alinhar o LEAD_IN_MS com o BPM do chart.

---

### 10. Bug: animação para quando health = 0 no mesmo frame
**Atual:** `if (!state.songEnded && state.health > 0)` — quando health chega a 0, o `requestAnimationFrame` para imediatamente.  
**Isso causa:** Tela preta abrupta, sem chance de ver o estado final.

**Arquivo:** `client/src/pages/FNF.tsx` linha 412  
**Ação:** Quando health = 0, continuar o loop por mais ~10 frames para mostrar o estado final das notas e o death event, depois parar e ir pra tela de resultado.

---

## Ordem de execução sugerida

### Fase 1 — Correções críticas (bugs)
1. Consertar game over abrupto (item 10) — parar loop com delay visual
2. Adicionar transição de morte (item 5)
3. Corrigir cores das notas (item 1)

### Fase 2 — Engine
4. Ajustar timing windows e adicionar rating "bad" (item 4)
5. Melhorar chart com BPM e variedade (item 6)
6. Adicionar accuracy e rating letter (item 7)

### Fase 3 — Renderização
7. Implementar estados do receptor (item 2)
8. Refinar sustain trail com clipping (item 3)
9. Adicionar feedback de hold no receptor (item 8)

### Fase 4 — Polish
10. Alinhar countdown com BPM (item 9)

---

## Arquivos a modificar

| Arquivo | Mudanças |
|---------|----------|
| `client/src/features/fnf/engine.ts` | Timing windows, accuracy, chart BPM, bad rating |
| `client/src/features/fnf/engine.test.ts` | Atualizar testes conforme engine |
| `client/src/pages/FNF.tsx` | Cores, receptor states, sustain trail, death transition, loop fix |

## Arquivos NOVOS a criar (opcional)

| Arquivo | Conteúdo |
|---------|----------|
| `client/src/features/fnf/StrumlineNote.ts` | Classe para gerenciar estado visual do receptor |
| `client/src/features/fnf/SustainTrail.ts` | Classe para renderizar cauda de hold com clipping |

## Critérios de aceite

- [ ] Cores das notas: roxo ←, azul ↓, verde ↑, vermelho →
- [ ] Receptor muda visual quando pressiona/solta
- [ ] Cauda de hold encolhe conforme o tempo passa
- [ ] Música não "passa" quando perde (health ≤ 0 = derrota)
- [ ] Game over tem transição (não corta abruptamente)
- [ ] Rating "bad" entre good e miss
- [ ] Accuracy calculada no resultado
- [ ] Charts com BPM e durações variadas
- [ ] `npx tsc --noEmit` = 0 erros
- [ ] `npx vitest run` = todos passando
