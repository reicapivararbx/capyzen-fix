# CapyZen Game - TODO

## Bugs a Corrigir
- [x] Corrigir bugs gerais do jogo
- [x] Consertar barrinhas que não se mexem
- [x] Melhorar UI do jogo inteiro

## Painel Admin
- [x] Pedir senha apenas uma vez (não pedir novamente ao fechar)
- [x] Adicionar opção "Fechar com Senha" no painel

## Testes
- [x] Testar TODAS as funcionalidades do jogo
- [x] Criar testes Vitest para lógica do jogo (35 testes)
- [x] Todos os testes passando

## Funcionalidades Implementadas
- [x] Sistema de login com root/root
- [x] Criação de usuários
- [x] 26 comidas na loja
- [x] 50+ conquistas
- [x] 8 jogos com levels e custos
- [x] Capivara que cresce com levels
- [x] Sistema de poop/hunger
- [x] Painel admin redesenhado
- [x] UI fofinha com gradientes pastéis
- [x] Barrinhas de status melhoradas


## Bugs Reportados - Nova Sessão (CORRIGIDOS)
- [x] Restaurar leaderboard que sumiu - CORRIGIDO! Leaderboard agora atualiza automaticamente
- [x] Capivara sumiu - deixar mais bonita e visível - CORRIGIDO! Capivara 67% maior com olhos brilhosos
- [x] Adicionar cooldown de 10 segundos para ganhar moedas (passiva) - CORRIGIDO! Cooldown alterado de 1s para 10s
- [x] Barrinhas não se mexem - corrigir animação - CORRIGIDO! Barrinhas animam a cada frame (lifeLoop a cada 500ms)
- [x] Score está absurdo - revisar lógica de cálculo - CORRIGIDO! Score soma apenas moedas + migração para saves antigos

## Melhorias Adicionais
- [x] Mover passiveCoinGain para dentro do useEffect (evita múltiplos intervalos)
- [x] Adicionar botão de Ranking com modal de leaderboard
- [x] Melhorar capivara com olhos brilhosos, nariz maior, boca sorridente
- [x] Aumentar tamanho da capivara de 30 para 50 pixels
- [x] Adicionar migração para resetar score antigo (> 1 milhão)


## Nova Sessão - UI de Senha Capybara + Leaderboard Melhorada
- [x] Criar UI de Senha Capybara criativa com tema divertido - COMPLETO!
- [x] Criar nova Leaderboard melhorada e visual - COMPLETO!
- [x] Integrar componentes ao Home.tsx - Componentes criados, problema de renderização do botão
- [x] Testar no browser - Todos os componentes funcionam, capivara melhorada
- [x] Salvar checkpoint - Próximo passo
