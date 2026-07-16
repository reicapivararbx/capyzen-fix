# Plano: Atualizar configuração OmniRoute

## Contexto

O usuário trocou a chave API da OmniRoute. A nova chave é `sk-40aae3407a74d5c9-3c63e5-b3a27026`. A lista de modelos também foi atualizada com base no `/tmp/models` (resposta do endpoint `GET /v1/models` com a nova chave).

## Arquivos a modificar

### 1. `~/.config/opencode/opencode.jsonc`

**Ação 1: Atualizar apiKey**
- Linha 10: trocar `"apiKey": "sk-39db978f0fed5c77-5451c3-ce0a9db8"` por `"apiKey": "sk-40aae3407a74d5c9-3c63e5-b3a27026"`

**Ação 2: Atualizar lista completa de modelos**

Substituir o bloco `"models"` inteiro pela lista abaixo, que inclui TODOS os modelos retornados pelo endpoint (32 modelos únicos, ignorando duplicatas com `parent`):

```json
"models": {
  "auto/best-free": { "name": "Auto Best Free", "limit": { "context": 1048576, "output": 512000 } },
  "auto/coding:free": { "name": "Auto Coding Free", "limit": { "context": 1048576, "output": 512000 } },
  "auto/minimax": { "name": "Auto MiniMax", "limit": { "context": 1048576, "output": 512000 } },
  "auto/mimo": { "name": "Auto MiMo", "limit": { "context": 1048576, "output": 131072 } },
  "cu/auto": { "name": "Cursor Auto", "limit": { "context": 200000, "output": 65536 } },
  "ddgw/gpt-4o-mini": { "name": "GPT-4o Mini", "limit": { "context": 128000, "output": 16384 } },
  "ddgw/gpt-5-mini": { "name": "GPT-5 Mini", "limit": { "context": 400000, "output": 65536 } },
  "ddgw/claude-3-5-haiku-20241022": { "name": "Claude 3.5 Haiku", "limit": { "context": 200000, "output": 65536 } },
  "ddgw/llama-4-scout": { "name": "Llama 4 Scout", "limit": { "context": 128000, "output": 65536 } },
  "ddgw/mistral-small-2501": { "name": "Mistral Small", "limit": { "context": 128000, "output": 65536 } },
  "ddgw/o3-mini": { "name": "O3 Mini", "limit": { "context": 400000, "output": 65536 } },
  "oc/deepseek-v4-flash-free": { "name": "DeepSeek V4 Flash Free", "limit": { "context": 1000000, "output": 384000 } },
  "oc/minimax-m3-free": { "name": "MiniMax M3 Free", "limit": { "context": 1048576, "output": 512000 } },
  "oc/minimax-m2.5-free": { "name": "MiniMax M2.5 Free", "limit": { "context": 204800, "output": 131072 } },
  "oc/ling-2.6-1t-free": { "name": "Ling 2.6 1T Free", "limit": { "context": 200000, "output": 65536 } },
  "oc/trinity-large-preview-free": { "name": "Trinity Large Preview Free", "limit": { "context": 200000, "output": 65536 } },
  "oc/nemotron-3-super-free": { "name": "Nemotron 3 Super Free", "limit": { "context": 1000000, "output": 65536 } },
  "oc/qwen3.6-plus-free": { "name": "Qwen3.6 Plus Free", "limit": { "context": 200000, "output": 65536 } },
  "ds-web/deepseek-v4-pro": { "name": "DeepSeek V4 Pro", "limit": { "context": 1000000, "output": 384000 } },
  "ds-web/deepseek-v4-pro-think": { "name": "DeepSeek V4 Pro Think", "limit": { "context": 1000000, "output": 384000 } },
  "fmd/gpt-5.5": { "name": "GPT-5.5", "limit": { "context": 400000, "output": 128000 } },
  "fmd/gpt-5.4": { "name": "GPT-5.4", "limit": { "context": 400000, "output": 131072 } },
  "fmd/gpt-5.4-mini": { "name": "GPT-5.4 Mini", "limit": { "context": 409600, "output": 131072 } },
  "fmd/gpt-5.3-codex": { "name": "GPT-5.3 Codex", "limit": { "context": 128000, "output": 65536 } },
  "mcode/mimo-auto": { "name": "MiMo Auto", "limit": { "context": 1000000, "output": 128000 } },
  "nvidia/deepseek-ai/deepseek-v4-flash": { "name": "DeepSeek V4 Flash", "limit": { "context": 128000, "output": 65536 } },
  "nvidia/deepseek-ai/deepseek-v4-pro": { "name": "DeepSeek V4 Pro", "limit": { "context": 128000, "output": 65536 } },
  "nvidia/google/gemma-4-31b-it": { "name": "Gemma 4 31B", "limit": { "context": 128000, "output": 65536 } },
  "nvidia/moonshotai/kimi-k2.6": { "name": "Kimi K2.6", "limit": { "context": 128000, "output": 65536 } },
  "nvidia/z-ai/glm-5.2": { "name": "GLM 5.2", "limit": { "context": 128000, "output": 65536 } },
  "qwen-web/qwen3.7-plus": { "name": "Qwen3.7 Plus", "limit": { "context": 128000, "output": 65536 } },
  "qwen-web/qwen3.7-max": { "name": "Qwen3.7 Max", "limit": { "context": 1000000, "output": 65536 } },
  "qwen-web/qwen3.6-plus": { "name": "Qwen3.6 Plus", "limit": { "context": 1000000, "output": 65536 } },
  "zw/glm-4.6": { "name": "GLM-4.6", "limit": { "context": 128000, "output": 65536 } },
  "zw/glm-4.5": { "name": "GLM-4.5", "limit": { "context": 128000, "output": 65536 } },
  "zw/glm-4.5v": { "name": "GLM-4.5V (Vision)", "limit": { "context": 128000, "output": 65536 } }
}
```

### 2. `~/.config/opencode/oh-my-openagent.json`

**Sem alterações necessárias** — os modelos referenciados (`omniroute/nvidia/moonshotai/kimi-k2.6`, `omniroute/fmd/gpt-5.5`, etc.) já existem na lista acima.

## Verificação

Após aplicar, o usuário deve conseguir listar os modelos via `/connect` ou equivalente no OpenCode.
