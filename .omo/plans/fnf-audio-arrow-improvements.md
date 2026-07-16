## TL;DR (For humans)
Trocar sons do FNF: "fah" (WhatsApp) qdo erra, "gunshot" qdo acerta (remove 4 sons de lane). Adicionar botão "me teste" com embed do WhatsApp. Melhorias nas setas/receptors baseado nos repos de referência. Consertar base path dos SFX.

---

## Fonoteca — novo esquema de sons

### Sons a remover do SFX (AudioManager)
- `lane0: /sfx/ah_medium.mp3`
- `lane1: /sfx/ai_short.mp3`
- `lane2: /sfx/ah_short.mp3`
- `lane3: /sfx/auh_medium.mp3`
- `miss: /sfx/fnf-missnote-1.mp3`

### Sons a adicionar
| Chave | Arquivo | Origem | Volume |
|-------|---------|--------|--------|
| `hit` | `/sfx/gunshot.mp3` | Download (freesound.org) | 0.6 |
| `fah` | `/sfx/fah.mp3` | `https://www.myinstants.com/media/sounds/botao-do-whatsapp.mp3` | 0.8 |

### Sons mantidos
- `death: /sfx/fnf-lost-sfx.mp3`
- `intro3, intro2, intro1, introgo`

## [x] Todo 1 — Baixar sons e colocar em `client/public/sfx/`

1. [x] Baixar `fah.mp3` de `https://www.myinstants.com/media/sounds/botao-do-whatsapp.mp3`
2. [x] Baixar `gunshot.mp3` de fonte livre (ex: freesound.org)
3. [x] Salvar ambos em `client/public/sfx/`
4. [x] Remover os 4 sons de lane antigos (`ah_medium.mp3`, `ai_short.mp3`, `ah_short.mp3`, `auh_medium.mp3`)
5. [x] Remover `fnf-missnote-1.mp3`

**QA**: `ls client/public/sfx/` mostra `fah.mp3` e `gunshot.mp3` (e mantidos)

## [x] Todo 2 — Atualizar `AudioManager` em `client/src/pages/FNF.tsx`

1. [x] Trocar `SFX` static map:
   - Remover `lane0..lane3` e `miss`
   - Adicionar `hit: '/sfx/gunshot.mp3'` e `fah: '/sfx/fah.mp3'`
2. [x] Remover método `lane(l: Lane)` — não mais necessário
3. [x] Substituir chamadas:
   - `audio.lane(note.lane)` → `audio.hit()` no `handleEngineEvent` (`case 'note_hit'`)
   - `audio.miss()` → `audio.fah()` no `handleEngineEvent` (`case 'note_miss'` e `case 'hold_dropped'`)
4. [x] Adicionar métodos:
   ```typescript
   hit(): void { this.play('hit', 0.6); }
   fah(): void { this.play('fah', 0.8); }
   ```

**QA**: Navegar até /fnf, tocar uma música, verificar que acertar nota toca gunshot e errar toca fah.

## [x] Todo 3 — Adicionar botão "me teste" com WhatsApp embed

1. [x] No JSX da tela de `song_select` ou `result`, adicionar um botão/iframe com o embed do WhatsApp
2. [x] Posicionar na parte inferior da tela, antes dos controles
3. [x] Usar o embed HTML fornecido:
   ```html
   <iframe width="110" height="200" src="https://www.myinstants.com/instant/botao-do-whatsapp-97196/embed/" frameborder="0" scrolling="no"></iframe>
   ```
4. [x] Adicionar texto "me teste" acima ou abaixo

**QA**: O iframe aparece na tela de seleção de música e o som toca ao clicar.

## [x] Todo 4 — Melhorias nas setas (receptors/arrows)

Baseado nos repositórios:
- **CodenameEngine**: Usa setas com outline branco grosso + glow (já implementado parcialmente)
- **Mario Madness V2 CNE**: Receptor animations com bounce + splash particles maiores
- **FunkinCrew/funkin**: Arrows no estilo original com coloração mais vibrante
- **sillybilly.github.io**: Implementação web com touch support

### Mudanças no `drawArrow()` e `drawLaneSet()`
1. [x] **Arrow hit animation**: Quando o player acerta uma nota, a seta do receptor faz um "click" visual (encolhe rápido e volta) - usar escala com easing
2. [x] **Glow no receptor ativo**: Adicionar um glow/brilho externo (sombra) no receptor quando pressionado
3. [x] **Opponent lane colors**: Usar cores mais escuras/saturadas (já tem OPP_LANE_COLORS)
4. [x] **Hit sparkle**: Partículas de "estrela" no hit (além do splash atual)

**QA**: Verificar visualmente que as setas têm glow e bounce animation.

## [x] Todo 5 — Consertar base path dos SFX

O Vite config tem `base: "/matteo/"`, então as URLs dos SFX precisam do prefixo. Os paths atuais são absolutos (`/sfx/...`) sem o base.

**Solução**: No AudioManager, prefixar com `import.meta.env.BASE_URL`:
```typescript
private static SFX = {
  miss: `${import.meta.env.BASE_URL}sfx/fnf-missnote-1.mp3`,
  ...
}
```
Ou usar caminhos relativos ao arquivo.

**QA**: `npx tsc --noEmit` zero erros; sons carregam sem 404 no console.

## [x] Verification Final
1. [x] `npx tsc --noEmit` — zero erros
2. [x] `npx vitest run` — 198/198 tests pass
3. Navegar /fnf, tocar música, verificar:
   - Hit → gunshot sound
   - Miss → "fah" (WhatsApp)
   - Botão "me teste" visível e funcional
   - Setas com glow + bounce animation
   - SFX sem 404 no console

## Must-NOT-Have
- Não mudar lógica do engine (engine.ts / engine.test.ts)
- Não mudar chart generation
- Não adicionar novas músicas
- Não mudar dual strum lines existentes
