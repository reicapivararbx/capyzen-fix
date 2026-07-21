📘 DOCUMENTO MASTER DE DESENVOLVIMENTO
Plano completo de evolução, redesign, segurança, gameplay e expansão do universo CapyZen
🌎 VISÃO GERAL DO PROJETO
Nome:

CapyZen Multiplayer

Conceito:

O CapyZen será um universo virtual de capivaras onde jogadores poderão explorar um mundo natural, evoluir seus personagens, participar de atividades, interagir com outros jogadores e construir sua própria história.

O jogo terá como pilares:

🐹 Vida e evolução da capivara;
🌎 Mundo aberto;
🎮 Minigames;
👥 Multiplayer;
🏆 Progressão;
🎨 Personalização;
💰 Economia;
🌦️ Ambiente dinâmico;
🔐 Segurança.
🎯 OBJETIVO PRINCIPAL

Transformar o CapyGame em uma experiência completa, moderna e preparada para expansão.

O jogador deve sentir que:

"Minha capivara vive em um mundo próprio, cresce, explora, conquista itens, faz amigos e participa de aventuras."

🎮 INTERFACE PRINCIPAL
Redesign dos botões principais

Botões:

🐹 FNF
⚙️ ADMIN
💬 CHAT
🚪 SAIR
Melhorias obrigatórias:
Aumentar significativamente o tamanho dos botões;
Melhorar a área de clique;
Criar espaçamento adequado;
Evitar sobreposição;
Melhorar organização visual;
Criar aparência profissional;
Usar bordas arredondadas;
Adicionar animações;
Criar efeitos de clique;
Melhorar contraste.
Organização visual:
        🐹 CAPYZEN


     [ 🐹 FNF ]


     [ ⚙️ ADMIN ]


     [ 💬 CHAT ]


     [ 🚪 SAIR ]

Cada botão deve possuir:

espaço individual;
área confortável;
fácil acesso;
adaptação para telas pequenas.
🌎 NOVO CENÁRIO DO JOGO
Habitat natural das capivaras

Substituir o cenário simples por um ambiente realista.

O mundo deve transmitir:

natureza;
tranquilidade;
exploração;
vida.
Elementos do ambiente:
Água:
Rio;
Lago;
Reflexos;
Movimento;
Ondas;
Transparência.
Vegetação:
Árvores;
Plantas;
Flores;
Arbustos;
Grama detalhada.
Terreno:
Texturas naturais;
Pedras;
Trilhas;
Áreas com lama;
Relevo.
☀️ Sistema de iluminação

Adicionar:

Dia:
Sol;
Sombras;
Cores vivas.
Noite:
Lua;
Estrelas;
Iluminação ambiente;
Efeitos noturnos.
🌦️ Sistema climático

Adicionar suporte para:

Chuva;
Tempestades;
Neblina;
Mudanças de clima;
Eventos ambientais.
🔐 SISTEMA ADMINISTRADOR
Remover completamente o sistema de senha

Remover:

Campos de senha;
Senhas fixas;
Verificações por senha;
Textos relacionados à senha;
Segredos no frontend.
Novo sistema:

Criar controle baseado em permissões.

Fluxo:

Usuário entra

↓

Servidor verifica identidade

↓

Consulta permissões

↓

Libera ou bloqueia acesso
Separação de usuários:

Jogador:

role: player

Administrador:

role: admin
Proteções:
Validação no servidor;
Rotas protegidas;
Controle de cargos;
Nenhuma permissão confiável no navegador.
🧹 AUDITORIA DE SEGURANÇA

Verificar todo o projeto procurando:

Informações expostas:
Senhas;
Tokens;
Chaves;
Configurações privadas.
JavaScript:

Remover:

Dados sensíveis;
Credenciais;
Permissões falsas.
LocalStorage:

Evitar armazenar:

Dados importantes;
Permissões;
Valores que afetam gameplay.
🐹 SISTEMA DE EVOLUÇÃO

Criar sistema onde a capivara:

Ganha XP;
Sobe de nível;
Recebe recompensas;
Desbloqueia conteúdos.
💰 SISTEMA DE MOEDAS

Criar economia baseada em:

Ganhar moedas;
Gastar moedas;
Comprar itens;
Recompensas.
🏆 RANKING GLOBAL

Adicionar:

Ranking mundial;
Ranking semanal;
Ranking entre amigos.

Categorias:

Maior nível;
Mais moedas;
Mais conquistas;
Mais exploração.
🎖️ SISTEMA DE CONQUISTAS

Criar conquistas como:

Primeira exploração;
Primeira compra;
Maior nível;
Descoberta de áreas;
Participação em eventos.
🛒 LOJA

Criar loja com:

Itens;
Roupas;
Acessórios;
Decoração;
Skins.
🎨 PERSONALIZAÇÃO DA CAPIVARA

Adicionar:

Cores:
Escolha de cor;
Padrões;
Detalhes.
Acessórios:
Chapéus;
Óculos;
Colares;
Roupas.
Skins:

Exemplos:

Astronauta;
Pirata;
Mago;
Temáticas.
Animações:

Adicionar:

Caminhadas diferentes;
Danças;
Expressões;
Efeitos visuais.

💬 SISTEMA DE CHAT MULTIPLAYER — ESPECIFICAÇÃO TÉCNICA
Objetivo

Criar um sistema de comunicação em tempo real para o CapyZen utilizando WebSockets, permitindo que jogadores conectados ao mesmo ambiente troquem mensagens instantaneamente com segurança, persistência e controle.

Arquitetura do sistema

O sistema será dividido em três camadas:

CLIENTE
  |
  |
WebSocket
  |
  |
SERVIDOR CHAT
  |
  |
DATABASE
1. Cliente (Frontend)

Responsabilidades:

Abrir conexão WebSocket;
Enviar mensagens;
Receber mensagens;
Mostrar status da conexão;
Exibir erros amigáveis.

O cliente nunca deve:

acessar banco diretamente;
validar permissões sozinho;
guardar dados importantes.
2. Servidor WebSocket

Responsável por:

aceitar conexões;
autenticar jogadores;
controlar salas;
distribuir mensagens;
aplicar regras de segurança.

Cada conexão deve possuir:

{
  "userId": "123",
  "username": "CapyPlayer",
  "role": "player",
  "connected": true
}
3. Sistema de conexão

Fluxo:

Jogador abre Chat

↓

Frontend solicita conexão

↓

Servidor recebe WebSocket

↓

Servidor verifica usuário

↓

Servidor valida sessão

↓

Conexão aprovada

↓

Jogador entra na sala
Problema atual:

Erro:

Database not available
Diagnóstico necessário

Verificar:

Banco de dados
O serviço está ligado?
A URL do banco está correta?
As credenciais existem?
O servidor consegue acessar?
As tabelas foram criadas?
Backend

Verificar:

Arquivo de configuração;
Variáveis de ambiente;
Inicialização do banco;
Tratamento de exceções.
Sistema de inicialização

Ao iniciar o servidor:

Executar:

1. Iniciar servidor HTTP

2. Conectar Database

3. Testar conexão

4. Iniciar WebSocket

5. Liberar Chat

Nunca iniciar o Chat sem confirmar banco quando o histórico for obrigatório.

Tratamento de erro

Caso o banco falhe:

O sistema deve mudar para:

DATABASE_STATUS = OFFLINE

O usuário recebe:

⚠️ Chat temporariamente indisponível.
Tentando reconectar...

O servidor continua funcionando.

Reconexão automática

Criar:

tentativa inicial;
intervalo entre tentativas;
limite de tentativas;
registro no log.

Exemplo:

Banco caiu

↓

Tentativa 1

↓

Falhou

↓

Aguardar

↓

Tentativa 2

↓

Reconectado
Estrutura do banco

Tabela:

users

Guardar:

id
username
role
created_at
messages

Guardar:

id
user_id
message
room_id
created_at
chat_reports

Guardar:

id
reporter_id
message_id
reason
created_at
Segurança

Adicionar:

Anti-spam

Limitar:

mensagens por segundo;
tamanho máximo;
repetição.
Validação

Servidor deve bloquear:

mensagens vazias;
conteúdo inválido;
usuários não autenticados.
Banimento

Sistema:

Usuário envia mensagem proibida

↓

Moderador analisa

↓

Usuário recebe punição

↓

Banco registra ação
Logs

Registrar:

conexões;
desconexões;
erros;
falhas do banco;
ações administrativas.

Exemplo:

[CHAT]
User 532 conectado

[DATABASE]
Connection failed

[WEBSOCKET]
Retrying...
Resultado final esperado

O Chat do CapyZen deve possuir:

✅ WebSocket estável
✅ Banco conectado
✅ Mensagens em tempo real
✅ Histórico salvo
✅ Reconexão automática
✅ Segurança contra abuso
✅ Sistema preparado para milhares de jogadores

🔐 SISTEMA DE LOGIN E CONTAS — CAPYZEN
Tela de Login

Substituir:

❌ Username
❌ Password genérico

Por:

✅ Usuário
✅ Senha

Modelo:

        🐹 CAPYZEN


      Entrar na conta


   👤 Usuário

 [ Digite seu usuário ]


   🔒 Senha

 [ Digite sua senha ]


 [☑] Lembrar de mim


      [ ENTRAR ]


 Criar usuário     Esqueci a senha
👤 Sistema de usuário

O jogador terá uma conta própria.

Dados básicos:

Usuário
Senha
Data de criação
ID do jogador
Nível
XP
Moedas
Personalização
Configurações
🆕 Criar usuário

Ao clicar:

Criar usuário
        ↓
Tela de cadastro

Nova tela:

🐹 Criar conta


Usuário:

[____________]


Senha:

[____________]


Confirmar senha:

[____________]


Email (opcional):

[____________]


[ CRIAR CONTA ]
Processo de criação

Fluxo:

Jogador preenche dados

↓

Sistema verifica:

- Usuário já existe?
- Senha válida?
- Dados corretos?

↓

Cria conta

↓

Salva no Database

↓

Cria perfil inicial

↓

Entra no jogo
🗄️ Banco de dados

Ao criar usuário, salvar:

Tabela:

users

Exemplo:

{
 "id": 1523,
 "username": "CapyPlayer",
 "password_hash": "senha_criptografada",
 "created_at": "2026-07-21",
 "role": "player"
}
⚠️ Segurança da senha

Nunca salvar:

senha: 123456

Salvar:

password_hash:
a83hd82hd82h...

A senha deve ser protegida usando hash.

🔑 Login

Quando o jogador entra:

Usuário digitado

↓

Servidor procura usuário

↓

Compara senha protegida

↓

Login aprovado

↓

Carrega perfil
❓ Esqueci a senha

O botão deve funcionar.

Fluxo:

Esqueci a senha

↓

Usuário informa email/usuário

↓

Sistema verifica conta

↓

Envia recuperação

↓

Usuário cria nova senha

↓

Atualiza banco
🛡️ Proteções

Adicionar:

Limite de tentativas de login;
Bloqueio temporário contra ataques;
Sessão segura;
Logout;
Expiração de sessão.
🔗 Integração com o CapyGame

Depois do login:

O sistema carrega:

🐹 Capivara do jogador

nível;
XP;
moedas;
itens;
skins;
conquistas;
casa;
amigos.
Alteração no documento master:

Adicionar uma nova seção:

👥 SISTEMA DE CONTAS E AUTENTICAÇÃO

Com:

Cadastro de usuários;
Login;
Recuperação de senha;
Banco de dados;
Perfil do jogador;
Segurança de autenticação.
