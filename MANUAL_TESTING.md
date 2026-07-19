# CapyZen - Guia de Testes Manuais

Este documento descreve os testes manuais necessários para validar todas as funcionalidades do CapyZen Game.

## Pré-requisitos

- Servidor rodando em http://localhost:3000
- Navegador atualizado (Chrome, Firefox, Safari)
- Conta de teste: `root` / `root`

## Testes de Autenticação

### ✅ Login com Credenciais Válidas
- [ ] Abrir o jogo
- [ ] Inserir username: `root`
- [ ] Inserir password: `root`
- [ ] Clicar em "Entrar"
- [ ] **Esperado:** Deve entrar no jogo e exibir a capivara

### ✅ Login com Credenciais Inválidas
- [ ] Inserir username: `invalid`
- [ ] Inserir password: `wrong`
- [ ] Clicar em "Entrar"
- [ ] **Esperado:** Exibir mensagem "Usuario ou senha incorretos!"

### ✅ Validação de Username Curto
- [ ] Inserir username: `ab` (2 caracteres)
- [ ] Inserir password: `password123`
- [ ] Clicar em "Entrar"
- [ ] **Esperado:** Exibir mensagem "Usuário deve ter entre 3 e 20 caracteres!"

### ✅ Validação de Username Longo
- [ ] Inserir username: `a` x 21 caracteres
- [ ] Inserir password: `password123`
- [ ] Clicar em "Entrar"
- [ ] **Esperado:** Exibir mensagem "Usuário deve ter entre 3 e 20 caracteres!"

### ✅ Validação de Caracteres Inválidos
- [ ] Inserir username: `user@123!`
- [ ] Inserir password: `password123`
- [ ] Clicar em "Entrar"
- [ ] **Esperado:** Exibir mensagem "Usuário deve conter apenas letras, números, - e _!"

### ✅ Criar Novo Usuário
- [ ] Clicar em "Criar Usuário"
- [ ] Inserir username: `testuser123`
- [ ] Inserir password: `testpass123`
- [ ] Clicar em "Criar"
- [ ] **Esperado:** Novo usuário criado e fazer login automaticamente

### ✅ Rejeitar Usuário Duplicado
- [ ] Clicar em "Criar Usuário"
- [ ] Inserir username: `root` (já existe)
- [ ] Inserir password: `anypassword`
- [ ] Clicar em "Criar"
- [ ] **Esperado:** Exibir mensagem "Usuário já existe!"

## Testes de Gameplay

### ✅ Trabalhar (Work)
- [ ] Clicar no botão "💼 Trabalhar"
- [ ] **Esperado:** 
  - Moedas aumentam (ex: +50 💰)
  - XP aumenta
  - Mensagem: "💼 Trabalhou! +50 💰 +10 XP"
  - Cooldown de 10 segundos ativado
  - Botão fica desabilitado por 10 segundos

### ✅ Comer (Feed)
- [ ] Selecionar uma comida na loja (ex: 🌱 Grama)
- [ ] Clicar em "🍽️ Comer"
- [ ] **Esperado:**
  - Fome diminui
  - Felicidade aumenta (+10)
  - Coco aumenta (baseado na comida)
  - Mensagem exibe: "🍔 comeu [comida]! +[poop] 💩, +[hunger] 🍽️"

### ✅ Banheiro (Bathroom)
- [ ] Clicar em "🚽 Banheiro"
- [ ] **Esperado:**
  - Coco diminui (-20)
  - Moedas aumentam (+50)
  - Mensagem: "💩 Deu uma cagada remunerada! -20 coco"

### ✅ Carinho (Affection)
- [ ] Clicar em "❤️ Carinho"
- [ ] **Esperado:**
  - Felicidade aumenta (+15)
  - Sus diminui (-5)
  - Mensagem: "❤️ Carinho! +15 😄"
  - Cooldown de 2 segundos

### ✅ Barrinhas de Status
- [ ] Observar as barrinhas no topo esquerdo
- [ ] **Esperado:**
  - 🍽️ Fome: diminui lentamente (0.05 por tick)
  - 😄 Felicidade: diminui lentamente (0.02 por tick)
  - 💩 Coco: aumenta lentamente (0.01 por tick)
  - 🔴 Sus: diminui lentamente (0.01 por tick)
  - Todas animam suavemente a cada 500ms

## Testes de Loja

### ✅ Comprar Comida
- [ ] Clicar em "🛒 Loja"
- [ ] Selecionar uma comida (ex: 🥔 Batata - 10 moedas)
- [ ] Clicar em "Comprar"
- [ ] **Esperado:**
  - Moedas diminuem
  - Comida é adicionada ao inventário
  - Mensagem de confirmação

### ✅ Rejeitar Compra sem Moedas
- [ ] Ter menos moedas que o custo
- [ ] Tentar comprar uma comida cara
- [ ] **Esperado:** Mensagem "💸 Moedas insuficientes!"

### ✅ Mudar Cor da Capivara
- [ ] Clicar em "🎨 Cores"
- [ ] Selecionar uma cor
- [ ] **Esperado:**
  - Capivara muda de cor
  - Moedas diminuem (custo da cor)
  - Mensagem de confirmação

## Testes de Minigames

### ✅ Jogar Minigame
- [ ] Clicar em "🎮 Jogos"
- [ ] Selecionar um jogo (ex: "Roblox - 50 moedas")
- [ ] **Esperado:**
  - Moedas diminuem
  - Felicidade aumenta
  - Mensagem: "🎮 Jogou [game]! +20 😄"
  - Cooldown de 2 segundos

## Testes de Conquistas

### ✅ Desbloquear Conquista
- [ ] Realizar ações que desbloqueiam conquistas
- [ ] Clicar em "🏆 Conquistas"
- [ ] **Esperado:**
  - Conquistas aparecem na lista
  - Ícone muda quando desbloqueada
  - Mensagem de sucesso

## Testes de Progresso

### ✅ Salvar Progresso
- [ ] Jogar um pouco
- [ ] Clicar em "💾 Progresso"
- [ ] Clicar em "💾 Continuar Progresso"
- [ ] **Esperado:** Mensagem "✅ Progresso salvo!"

### ✅ Carregar Progresso
- [ ] Fazer logout
- [ ] Fazer login novamente
- [ ] **Esperado:** Estado anterior é restaurado (moedas, level, etc)

### ✅ Deletar Progresso
- [ ] Clicar em "💾 Progresso"
- [ ] Clicar em "🗑️ Excluir Progresso"
- [ ] **Esperado:**
  - Estado é resetado
  - Moedas = 0, Level = 1, etc
  - Mensagem "🔄 Progresso deletado!"

## Testes de Painel Admin

### ✅ Abrir Painel Admin
- [ ] Clicar em "⚙️ Painel Admin"
- [ ] Inserir senha: `admin123`
- [ ] **Esperado:** Painel admin abre

### ✅ Comandos Admin
- [ ] Clicar em "🌟 GOD MODE"
- [ ] **Esperado:**
  - Felicidade = 100
  - Fome = 100
  - Coco = 0
  - Moedas aumentam

### ✅ Fechar Painel com Senha
- [ ] Clicar em "Fechar com Senha"
- [ ] **Esperado:** Painel fecha e senha é resetada

## Testes de Ranking

### ✅ Ver Leaderboard
- [ ] Clicar em "🏅 Ranking"
- [ ] **Esperado:**
  - Modal exibe top 10 jogadores
  - Ordenado por score
  - Exibe username, score e level

### ✅ Score Atualiza
- [ ] Jogar e ganhar pontos
- [ ] Abrir leaderboard
- [ ] **Esperado:** Seu score aparece/atualiza na lista

## Testes de Logout

### ✅ Logout
- [ ] Clicar em "🚪 Sair"
- [ ] **Esperado:**
  - Volta para tela de login
  - Estado anterior é salvo
  - Pode fazer login novamente

## Testes de Performance

### ✅ Sem Lag
- [ ] Jogar por 5 minutos
- [ ] **Esperado:**
  - Jogo roda suavemente
  - Sem travamentos
  - Barrinhas animam fluidamente

### ✅ Sem Vazamento de Memória
- [ ] Abrir DevTools (F12)
- [ ] Ir para aba Memory
- [ ] Jogar por 10 minutos
- [ ] **Esperado:**
  - Memória não cresce indefinidamente
  - Sem erros no console

## Checklist Final

- [ ] Todos os testes de autenticação passaram
- [ ] Todos os testes de gameplay passaram
- [ ] Todos os testes de loja passaram
- [ ] Todos os testes de minigames passaram
- [ ] Todos os testes de conquistas passaram
- [ ] Todos os testes de progresso passaram
- [ ] Todos os testes de painel admin passaram
- [ ] Todos os testes de ranking passaram
- [ ] Todos os testes de logout passaram
- [ ] Todos os testes de performance passaram

## Notas

- Todos os testes devem ser executados em diferentes navegadores
- Testar em desktop e mobile
- Verificar console para erros
- Validar que não há console.log de produção
