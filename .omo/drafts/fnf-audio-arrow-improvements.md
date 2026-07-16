# Draft: FNF Sound & Arrow Improvements

## Intent
CLEAR - O usuário especificou exatamente o que quer: trocar sons de hit/miss, baixar sons novos, adicionar botão WhatsApp no jogo, e melhorias visuais nas setas/receptors.

review_required: false

## Decisions
- **Hit sound**: Substituir 4 sons de lane (ah_medium, ai_short, ah_short, auh_medium) por um único "gunshot"
- **Miss sound**: Substituir `fnf-missnote-1.mp3` por "fah" (WhatsApp button sound)
- **WhatsApp button**: Adicionar iframe embed do MyInstants no jogo como "me teste"
- **Arrow improvements**: Baseado nos repositórios de referência (CodenameEngine, Mario Madness CNE)
- **Base path fix**: SFX paths hardcoded sem `/matteo/` prefix — precisam ser consertados

## Sound Sources
- **fah.mp3**: https://www.myinstants.com/media/sounds/botao-do-whatsapp.mp3
- **gunshot.mp3**: Need to download from freesound.org or similar

## Pending Questions
Nenhuma — request é claro.

## Approval Gate
status: awaiting-approval
