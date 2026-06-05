// CapyZen Admin Panel - JavaScript Vanilla

// ============ CREDENCIAIS ============
const ADMIN_USER = "Can_u_please_give_me_adm";
const ADMIN_PASS = "umasenhaquequalquerpessoasabe";

const SECURITY_ANSWERS = {
  color: "turquesa",
  animal: "capivara",
  code: "307546",
  owner: "matteo"
};

// ============ VARIÁVEIS GLOBAIS ============
let adminLogs = [];
const MAX_LOGS = 100;

// ============ FUNÇÕES DE AUTENTICAÇÃO ============

function login() {
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value.trim();

  if (!username || !password) {
    alert("❌ Por favor, preencha todos os campos!");
    return;
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    sessionStorage.setItem("adminLoggedIn", "false");
    window.location.href = "security.html";
  } else {
    alert("❌ Usuário ou senha incorretos!");
    document.getElementById("user").value = "";
    document.getElementById("pass").value = "";
  }
}

function verifySecurity() {
  const color = document.getElementById("color").value.toLowerCase().trim();
  const animal = document.getElementById("animal").value.toLowerCase().trim();
  const code = document.getElementById("code").value.trim();
  const owner = document.getElementById("owner").value.toLowerCase().trim();

  if (!color || !animal || !code || !owner) {
    alert("❌ Por favor, responda todas as perguntas!");
    return;
  }

  if (
    color === SECURITY_ANSWERS.color &&
    animal === SECURITY_ANSWERS.animal &&
    code === SECURITY_ANSWERS.code &&
    owner === SECURITY_ANSWERS.owner
  ) {
    sessionStorage.setItem("adminLoggedIn", "true");
    window.location.href = "dashboard.html";
  } else {
    alert("❌ Respostas incorretas! Tente novamente.");
    document.getElementById("color").value = "";
    document.getElementById("animal").value = "";
    document.getElementById("code").value = "";
    document.getElementById("owner").value = "";
  }
}

// ============ FUNÇÕES DO DASHBOARD ============

function checkAdminAccess() {
  if (sessionStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "login.html";
  }
}

function logout() {
  if (confirm("Tem certeza que deseja sair?")) {
    sessionStorage.removeItem("adminLoggedIn");
    window.location.href = "login.html";
  }
}

// ============ SISTEMA DE LOGS ============

function addLog(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString("pt-BR");
  const logEntry = {
    timestamp,
    message,
    type
  };

  adminLogs.unshift(logEntry);
  if (adminLogs.length > MAX_LOGS) {
    adminLogs.pop();
  }

  updateLogsDisplay();
}

function updateLogsDisplay() {
  const logsContainer = document.getElementById("admin-logs");
  if (!logsContainer) return;

  logsContainer.innerHTML = "";

  adminLogs.forEach(log => {
    const logDiv = document.createElement("div");
    logDiv.className = `log-${log.type}`;
    logDiv.innerHTML = `<span class="log-time">[${log.timestamp}]</span> ${log.message}`;
    logsContainer.appendChild(logDiv);
  });
}

// ============ COMANDOS ADMINISTRATIVOS ============

const commands = [
  {
    name: "📢 Anúncio Global",
    description: "Enviar anúncio para todos os jogadores",
    action: () => {
      const message = prompt("Digite o anúncio:");
      if (message) {
        addLog(`Anúncio enviado: "${message}"`, "success");
        alert("✅ Anúncio enviado com sucesso!");
      }
    }
  },
  {
    name: "🔄 Reiniciar Servidores",
    description: "Reiniciar todos os servidores",
    action: () => {
      addLog("Servidores reiniciados", "success");
      alert("✅ Servidores reiniciados com sucesso!");
    }
  },
  {
    name: "💀 Matar Todos",
    description: "Game over para todas as capivaras",
    action: () => {
      if (confirm("⚠️ Tem certeza? Isso vai dar game over em TODOS!")) {
        addLog("Todas as capivaras foram mortas", "warning");
        alert("💀 Todas as capivaras foram mortas!");
      }
    }
  },
  {
    name: "⚔️ God Mode Todos",
    description: "Ativar god mode para todos",
    action: () => {
      addLog("God mode ativado para todos os jogadores", "success");
      alert("✅ God mode ativado para todos!");
    }
  },
  {
    name: "💰 Dinheiro Infinito",
    description: "Dar dinheiro infinito a todos",
    action: () => {
      addLog("Dinheiro infinito ativado globalmente", "success");
      alert("💰 Dinheiro infinito ativado!");
    }
  },
  {
    name: "🚫 Banir Jogador",
    description: "Banir um jogador específico",
    action: () => {
      const username = prompt("Digite o nome do jogador:");
      if (username) {
        addLog(`Jogador '${username}' foi banido`, "warning");
        alert(`✅ Jogador '${username}' foi banido!`);
      }
    }
  },
  {
    name: "🔇 Mutar Todos",
    description: "Mutar o chat para todos",
    action: () => {
      addLog("Chat mutado para todos os jogadores", "warning");
      alert("🔇 Chat mutado para todos!");
    }
  },
  {
    name: "🍖 Alimentar Todos",
    description: "Alimentar todas as capivaras",
    action: () => {
      addLog("Todas as capivaras foram alimentadas", "success");
      alert("🍖 Todas as capivaras foram alimentadas!");
    }
  },
  {
    name: "📊 Ver Estatísticas",
    description: "Ver estatísticas do servidor",
    action: () => {
      const stats = `
Estatísticas do Servidor:
- Jogadores Online: 127
- Economia Global: 999,999 moedas
- Uptime: 72 horas
- Alertas: 0
      `;
      addLog("Estatísticas do servidor consultadas", "info");
      alert(stats);
    }
  },
  {
    name: "🧹 Limpar Chat",
    description: "Limpar histórico do chat",
    action: () => {
      addLog("Chat foi limpo", "success");
      alert("✅ Chat foi limpo!");
    }
  },
  {
    name: "🏆 Ver Ranking",
    description: "Ver ranking de jogadores",
    action: () => {
      addLog("Ranking de jogadores consultado", "info");
      alert("✅ Ranking carregado com sucesso!");
    }
  },
  {
    name: "🔒 Travar Servidor",
    description: "Travar o servidor (ninguém entra)",
    action: () => {
      if (confirm("⚠️ Tem certeza? Ninguém conseguirá entrar!")) {
        addLog("Servidor foi travado", "warning");
        alert("🔒 Servidor travado!");
      }
    }
  },
  {
    name: "💊 Curar Todos",
    description: "Curar todas as capivaras",
    action: () => {
      addLog("Todas as capivaras foram curadas", "success");
      alert("💊 Todas as capivaras foram curadas!");
    }
  },
  {
    name: "🎪 Modo Festival",
    description: "Ativar modo festival",
    action: () => {
      addLog("Modo festival ativado", "success");
      alert("🎪 Modo festival ativado!");
    }
  },
  {
    name: "🌙 Modo Noturno",
    description: "Ativar modo noturno",
    action: () => {
      addLog("Modo noturno ativado", "success");
      alert("🌙 Modo noturno ativado!");
    }
  },
  {
    name: "🎄 Modo Natal",
    description: "Ativar modo natal",
    action: () => {
      addLog("Modo natal ativado", "success");
      alert("🎄 Modo natal ativado!");
    }
  },
  {
    name: "🌀 Modo Caos",
    description: "Ativar modo caos (tudo aleatório)",
    action: () => {
      if (confirm("⚠️ Modo caos vai deixar tudo aleatório! Continuar?")) {
        addLog("Modo caos ativado", "warning");
        alert("🌀 Modo caos ativado! Que comece a loucura!");
      }
    }
  },
  {
    name: "💾 Backup Manual",
    description: "Fazer backup manual do servidor",
    action: () => {
      addLog("Backup do servidor realizado com sucesso", "success");
      alert("✅ Backup realizado com sucesso!");
    }
  },
  {
    name: "🚨 Modo Emergência",
    description: "Ativar modo emergência",
    action: () => {
      if (confirm("⚠️ Ativar modo emergência?")) {
        addLog("Modo emergência ativado", "warning");
        alert("🚨 Modo emergência ativado!");
      }
    }
  },
  {
    name: "📵 Bloquear Chat",
    description: "Bloquear chat para todos",
    action: () => {
      addLog("Chat bloqueado para todos os jogadores", "warning");
      alert("📵 Chat bloqueado para todos!");
    }
  }
];

// ============ CARREGAMENTO DE COMANDOS ============

function loadCommands() {
  const container = document.getElementById("commands");
  if (!container) return;

  container.innerHTML = "";

  commands.forEach(command => {
    const btn = document.createElement("button");
    btn.className = "command-btn";
    btn.textContent = command.name;
    btn.title = command.description;

    btn.onclick = () => {
      command.action();
    };

    container.appendChild(btn);
  });
}

// ============ NAVEGAÇÃO DE ABAS ============

function switchTab(tabName) {
  // Ocultar todas as abas
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach(tab => tab.classList.remove("active"));

  // Remover ativo de todos os itens de menu
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => item.classList.remove("active"));

  // Mostrar aba selecionada
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  // Marcar item de menu como ativo
  event.target.classList.add("active");

  // Se é a aba de comandos, carregar os comandos
  if (tabName === "commands") {
    loadCommands();
  }
}

// ============ CONFIGURAÇÕES ============

function resetSettings() {
  if (confirm("Tem certeza que deseja resetar todas as configurações?")) {
    document.getElementById("auto-save").checked = true;
    document.getElementById("notifications").checked = true;
    document.getElementById("dark-mode").checked = true;
    addLog("Configurações foram resetadas", "info");
    alert("✅ Configurações resetadas!");
  }
}

// ============ INICIALIZAÇÃO ============

document.addEventListener("DOMContentLoaded", () => {
  // Verificar acesso ao dashboard
  if (document.querySelector(".dashboard")) {
    checkAdminAccess();
    loadCommands();
    addLog("Painel admin carregado com sucesso", "success");
  }

  // Permitir Enter para fazer login
  const inputs = document.querySelectorAll(".input-field");
  inputs.forEach(input => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (document.querySelector(".auth-box")) {
          // Se está na página de login
          if (document.getElementById("pass")) {
            login();
          }
          // Se está na página de segurança
          if (document.getElementById("code")) {
            verifySecurity();
          }
        }
      }
    });
  });
});

// ============ LOGS INICIAIS ============

addLog("Sistema de admin inicializado", "info");
addLog("Aguardando autenticação...", "info");
