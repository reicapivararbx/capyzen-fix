# Plano de Migração: CapyGame → Unity 3D WebGL

**Data:** 2026-07-18
**Status:** Em andamento

---

## Visão Geral

Migrar o CapyGame (atualmente React + Node.js) para Unity 3D com build WebGL, rodando no browser. O backend Node.js continua responsável por auth, banco de dados e chat.

### Stack Atual vs Nova Stack

| Componente | Atual | Novo |
|------------|-------|------|
| **Frontend** | React 19 + Vite | Unity 2022+ LTS (WebGL) |
| **Backend** | Express.js | Express.js (mantido) |
| **Banco** | SQLite (Drizzle) | SQLite (mantido) |
| **Deploy** | game.zanona.com.br | game.zanona.com.br (mantido) |

---

## 🎯 Arquitetura Final

```
┌─────────────────────────────────────────────────┐
│                    BROWSER                       │
│  ┌─────────────────────────────────────────┐    │
│  │         Unity WebGL Build               │    │
│  │  ┌─────────┐  ┌─────────┐  ┌────────┐  │    │
│  │  │Tamagotchi│  │  Ritmo  │  │  Chat  │  │    │
│  │  │  3D      │  │  FNF    │  │  UI    │  │    │
│  │  └─────────┘  └─────────┘  └────────┘  │    │
│  └─────────────────────────────────────────┘    │
│                      │ REST API                  │
└──────────────────────┼──────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────┐
│              OCI Free Tier Server               │
│  ┌──────────────────┴─────────────────────┐     │
│  │           Node.js Backend              │     │
│  │  ┌──────┐  ┌────────┐  ┌──────────┐   │     │
│  │  │ Auth │  │ SQLite │  │   Chat   │   │     │
│  │  └──────┘  └────────┘  └──────────┘   │     │
│  └────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

---

## 📋 Fases de Desenvolvimento

### Fase 1: Setup e Configuração (1-2 dias)

**Objetivo:** Ter o Unity funcionando e pronto pra desarrollo.

#### Tarefas:
- [ ] Instalar **Unity Hub** (https://unity.com/download)
- [ ] Instalar **Unity Editor 2022 LTS** (ou mais recente)
- [ ] Criar projeto 3D no Unity
- [ ] Configurar build target: WebGL
- [ ] Testar build WebGL básica (Hello World)
- [ ] Configurar version control (Git + Git LFS para assets)

#### Ferramentas necessárias:
- Unity Hub: https://unity.com/download
- Git LFS: https://git-lfs.github.com/
- Visual Studio ou Rider (para C#)

#### Dicas:
- Usar **Unity 2022 LTS** (estável, boa documentação WebGL)
- Criar branch `unity-migration` no Git
- Configurar `.gitattributes` pra Git LFS (assets grandes)

---

### Fase 2: Assets 3D (1-2 semanas)

**Objetivo:** Ter personagens, cenários e props prontos sem saber modelar.

#### Estratégia de Assets (sem modelagem):

| Tipo | Fonte | Custo | Link |
|------|-------|-------|------|
| **Personagens Low Poly** | Quaternius | Grátis | https://quaternius.com |
| **Props e Cenários** | Kenney.nl | Grátis | https://kenney.nl/assets |
| **Animações** | Mixamo | Grátis | https://www.mixamo.com |
| **UI Pack** | Kenney UI | Grátis | https://kenney.nl/assets/abstract-game-icons |
| **Terreno** | Unity Terrain Tools | Grátis (built-in) | - |

#### Tarefas:
- [ ] Baixar personagens base do **Quaternius**
- [ ] Criar conta no **Mixamo** e configurar animações:
  - Idle (parado)
  - Walk (andar)
  - Dance (dançar — pro ritmo)
  - Jump (pular)
  - Eat (comer — pro tamagotchi)
- [ ] Baixar props do **Kenney** (mesas, cadeiras, pratos, etc.)
- [ ] Baixar UI pack do Kenney
- [ ] Importar tudo no Unity (Assets/ folder)
- [ ] Configurar materiais e texturas

#### Dicas:
- **Quaternius** tem personagens prontos com rigging — só baixar e usar
- **Mixamo** aceita qualquer modelo e gera animações automaticamente
- Usar **low poly** (poucos polígonos) — roda melhor em WebGL
- Organizar em pastas: `Assets/Characters/`, `Assets/Props/`, `Assets/UI/`

---

### Fase 3: Gameplay Core (2-4 semanas)

**Objetivo:** Implementar a jogabilidade principal.

#### 3.1 Sistema de Tamagotchi 3D (1 semana)

**Lógica a implementar:**
```
┌─────────────────────────────────────┐
│           Tamagotchi 3D             │
├─────────────────────────────────────┤
│  - Fome (HUD bar)                   │
│  - Energia (HUD bar)                │
│  - Felicidade (HUD bar)             │
│  - Interações: Comer, Dormir, Jogar │
│  - Animações: Idle, Eat, Sleep, Play│
│  - Tempo real: stats diminuem com   │
│    o tempo                          │
└─────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar `TamagotchiController.cs`
- [ ] Implementar stats (fome, energia, felicidade)
- [ ] Implementar timer de decaimento
- [ ] Criar UI de stats (barras)
- [ ] Implementar interações (comer, dormir, jogar)
- [ ] Conectar animações do Mixamo

#### 3.2 Sistema de Ritmo/FNF (1-2 semanas)

**Lógica a implementar:**
```
┌─────────────────────────────────────┐
│        Rhythm Game (FNF Style)      │
├─────────────────────────────────────┤
│  - Notas descendo (4 colunas: ← ↓ ↑ →)│
│  - Input: setas do teclado          │
│  - Timing: Perfeito/Ótimo/Bom/Ruim │
│  - Combo e pontuação                │
│  - Música sincronizada              │
│  - Charts: arquivo JSON com notas   │
└─────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar `RhythmGameManager.cs`
- [ ] Implementar sistema de notas (spawner, movement)
- [ ] Implementar detecção de input (setas)
- [ ] Implementar timing window (Perfect, Great, Good, Miss)
- [ ] Criar sistema de combo e score
- [ ] Criar UI do ritmo (notas, barras, score)
- [ ] Sincronizar com áudio (AudioSource + BPM)
- [ ] Criar formato de chart (JSON simples)

#### 3.3 Sistema de Chat (0.5 semana)

**Tarefas:**
- [ ] Criar UI de chat no Unity (InputField + ScrollRect)
- [ ] Integrar com API REST do backend Node.js
- [ ] WebSocket ou polling pra mensagens em tempo real

---

### Fase 4: Integração Backend (1 semana)

**Objetivo:** Conectar o Unity com o servidor Node.js existente.

#### API REST (já existe no backend):
```
POST /api/auth/login
POST /api/auth/register
GET  /api/user/profile
PUT  /api/user/tamagotchi
GET  /api/chat/messages
POST /api/chat/send
GET  /api/fnf/scores
POST /api/fnf/scores
```

#### Tarefas:
- [ ] Criar `ApiClient.cs` (HTTP requests)
- [ ] Criar `AuthManager.cs` (login, token, sessão)
- [ ] Criar `SaveManager.cs` (salvar/carregar progresso)
- [ ] Integrar com SQLite via API
- [ ] Testar fluxo: login → jogar → salvar → carregar

#### Dicas:
- Usar `UnityWebRequest` pra HTTP requests
- Salvar token JWT em PlayerPrefs
- Fazer cache local pra dados que não mudam

---

### Fase 5: Build e Deploy (2-3 dias)

**Objetivo:** Publicar o jogo no game.zanona.com.br.

#### Tarefas:
- [ ] Configurar Build Settings:
  - Player Settings → WebGL
  - Compression: Brotli (melhor compression)
  - Memory Size: 512MB (ou menos pra OCI free tier)
- [ ] Build WebGL (gera pasta com index.html + build)
- [ ] Testar build localmente
- [ ] Fazer upload pro servidor
- [ ] Configurar Caddy pra servir WebGL:
  ```
  game.zanona.com.br {
      root * /var/www/capygame-webgl
      try_files {path} /index.html
      file_server
      encode gzip brotli
  }
  ```
- [ ] Testar em produção
- [ ] Otimizar tamanho do build (Addressables, Asset Bundles)

#### Dicas:
- WebGL build é grande (10-50MB) — usar **Brotli compression**
- Configurar **streaming assets** pra carregar conteúdo sob demanda
- Testar em diferentes browsers (Chrome, Firefox, Safari)
- Usar **Addressables** pra dividir assets em chunks

---

## 🛠️ Ferramentas Necessárias

| Ferramenta | O que é | Link |
|------------|---------|------|
| Unity Hub | Gerenciador de projetos Unity | https://unity.com/download |
| Unity Editor | Editor do Unity (2022 LTS) | Via Unity Hub |
| Visual Studio | IDE pra C# | https://visualstudio.microsoft.com |
| Git LFS | Versionamento de assets | https://git-lfs.github.com |
| Blender | Modelagem 3D (opcional) | https://www.blender.org |
| Mixamo | Animações automáticas | https://www.mixamo.com |

---

## 📁 Estrutura do Projeto Unity

```
CapyGame-Unity/
├── Assets/
│   ├── Characters/        # Personagens (Quaternius/Mixamo)
│   │   ├── Player/
│   │   └── NPCs/
│   ├── Props/             # Objetos (Kenney)
│   │   ├── Food/
│   │   ├── Furniture/
│   │   └── UI/
│   ├── Scenes/            # Cenas
│   │   ├── MainMenu.unity
│   │   ├── Tamagotchi.unity
│   │   └── Rhythm.unity
│   ├── Scripts/           # Código C#
│   │   ├── Core/
│   │   ├── Tamagotchi/
│   │   ├── Rhythm/
│   │   ├── UI/
│   │   └── API/
│   ├── Audio/             # Músicas e sons
│   │   ├── Music/
│   │   └── SFX/
│   └── Prefabs/           # Prefabs reutilizáveis
├── ProjectSettings/
├── Packages/
└── Builds/
    └── WebGL/
```

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Build WebGL muito grande | Alto | Addressables, compressão Brotli |
| Performance ruim em celular | Médio | Low poly, otimização de draw calls |
| OCI free tier sem RAM | Alto | Otimizar build, reduzir assets |
| Assets 3D gratuitos parecem "genéricos" | Médio | Customizar com materiais, texturas |
| Integração backend complexa | Médio | Criar API client robusto, testar cedo |

---

## 📅 Cronograma Estimado

| Fase | Duração | Dependências |
|------|---------|--------------|
| Fase 1: Setup | 1-2 dias | Nenhuma |
| Fase 2: Assets | 1-2 semanas | Fase 1 |
| Fase 3: Gameplay | 2-4 semanas | Fase 2 |
| Fase 4: Backend | 1 semana | Fase 3 |
| Fase 5: Deploy | 2-3 dias | Fase 4 |
| **Total** | **~6-8 semanas** | - |

---

## 🚀 Próximos Passos Imediatos

1. **Instalar Unity Hub + Editor** (seu coroa)
2. **Criar projeto 3D no Unity**
3. **Baixar assets do Quaternius + Kenney**
4. **Testar build WebGL básica**
5. **Começar Fase 3 (Gameplay)**

---

## 📚 Recursos Úteis

- [Unity Learn (tutoriais oficiais)](https://learn.unity.com)
- [Unity WebGL Docs](https://docs.unity3d.com/Manual/webgl.html)
- [Quaternius (assets grátis)](https://quaternius.com)
- [Kenney.nl (assets grátis)](https://kenney.nl)
- [Mixamo (animações grátis)](https://www.mixamo.com)
- [C# Reference](https://docs.microsoft.com/pt-br/dotnet/csharp/)

---

**Última atualização:** 2026-07-18