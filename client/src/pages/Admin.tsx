import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { loadGameState, saveGameState, updateGameState, DEFAULT_GAME_STATE } from "@/lib/game-save";
import type { GameState } from "@/types/game";

interface AdminSession {
  username: string;
  role: "admin" | "player";
  token: string;
}

function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem("capyzen_admin_session");
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (session.role !== "admin") return null;
    return session;
  } catch {
    return null;
  }
}

function saveAdminSession(session: AdminSession) {
  localStorage.setItem("capyzen_admin_session", JSON.stringify(session));
}

function clearAdminSession() {
  localStorage.removeItem("capyzen_admin_session");
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function Admin() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [allGames, setAllGames] = useState<GameState[]>([]);

  useEffect(() => {
    const existing = getAdminSession();
    if (existing) {
      setSession(existing);
      loadAllGames();
    }
  }, []);

  const handleLogin = () => {
    setLoginError("");

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError("Usuário e senha são obrigatórios!");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("capyzen_users") || "{}");
      if (!users[loginUsername]) {
        setLoginError("Usuário não encontrado!");
        return;
      }
      if (users[loginUsername] !== loginPassword) {
        setLoginError("Senha incorreta!");
        setLoginPassword("");
        return;
      }

      const adminUsers = JSON.parse(localStorage.getItem("capyzen_admin_users") || "[]");
      const isAdmin = adminUsers.includes(loginUsername);

      if (!isAdmin) {
        setLoginError("Você não tem permissão de administrador!");
        return;
      }

      const newSession: AdminSession = {
        username: loginUsername,
        role: "admin",
        token: generateToken(),
      };
      saveAdminSession(newSession);
      setSession(newSession);
      setLoginUsername("");
      setLoginPassword("");
      loadAllGames();
    } catch {
      setLoginError("Erro ao verificar credenciais!");
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
    setAllGames([]);
  };

  const loadAllGames = () => {
    const state = loadGameState();
    if (state.playerName || state.capyName) {
      setAllGames([state]);
    } else {
      setAllGames([]);
    }
  };

  const resetAllData = () => {
    if (confirm("Tem certeza que deseja resetar TODOS os dados?")) {
      saveGameState({ ...DEFAULT_GAME_STATE, inventory: { ...DEFAULT_GAME_STATE.inventory } });
      setAllGames([]);
      alert("Todos os dados foram deletados!");
    }
  };

  const giveCoins = (amount: number) => {
    const state = loadGameState();
    if (!state.playerName && !state.capyName) {
      alert("Nenhum jogo salvo encontrado!");
      return;
    }
    const updated = updateGameState({ coins: state.coins + amount });
    setAllGames([updated]);
    alert(`${amount} moedas adicionadas!`);
  };

  const setMaxStats = () => {
    const state = loadGameState();
    if (!state.playerName && !state.capyName) {
      alert("Nenhum jogo salvo encontrado!");
      return;
    }
    updateGameState({
      hunger: 100,
      happiness: 100,
      energy: 100,
      health: 100,
      poop: 0,
      thirst: 100,
      hygiene: 100,
    });
    loadAllGames();
    alert("Todos os stats foram maximizados!");
  };

  const levelUp = () => {
    const state = loadGameState();
    if (!state.playerName && !state.capyName) {
      alert("Nenhum jogo salvo encontrado!");
      return;
    }
    const updated = updateGameState({ level: state.level + 1, xp: 0 });
    setAllGames([updated]);
    alert("Nível aumentado!");
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">⚙️ Painel Admin</h1>
            <p className="text-slate-400">Acesse com sua conta de administrador</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Usuário"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Senha"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />

            {loginError && (
              <p className="text-red-400 text-sm text-center">{loginError}</p>
            )}

            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              🔓 Entrar
            </Button>

            <Link href="/">
              <Button variant="outline" className="w-full">
                🐹 Voltar ao Jogo
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">⚙️ Painel Admin</h1>
            <p className="text-slate-400">Logado como: {session.username}</p>
          </div>
          <nav className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = "/"}>🐹 Jogo</Button>
            <Link href="/loja">
              <Button variant="outline">🛍️ Loja</Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              🚺 Sair
            </Button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">🎮 Comandos</h2>
          <div className="space-y-3">
            <Button onClick={() => giveCoins(500)} className="w-full bg-yellow-600 hover:bg-yellow-700">
              💰 Adicionar 500 Moedas
            </Button>
            <Button onClick={() => giveCoins(1000)} className="w-full bg-yellow-600 hover:bg-yellow-700">
              💰 Adicionar 1000 Moedas
            </Button>
            <Button onClick={setMaxStats} className="w-full bg-green-600 hover:bg-green-700">
              ✅ Maximizar Stats
            </Button>
            <Button onClick={levelUp} className="w-full bg-blue-600 hover:bg-blue-700">
              📈 Subir de Nível
            </Button>
            <Button onClick={resetAllData} className="w-full bg-red-600 hover:bg-red-700">
              🗑️ Deletar Todos os Dados
            </Button>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">📊 Estatísticas</h2>
          {allGames.length > 0 ? (
            <div className="space-y-4">
              {allGames.map((game, idx) => (
                <div key={idx} className="bg-slate-700 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Jogador:</span>
                      <p className="font-bold">{game.playerName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Capivara:</span>
                      <p className="font-bold">{game.capyName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Nível:</span>
                      <p className="font-bold text-blue-400">{game.level}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Moedas:</span>
                      <p className="font-bold text-yellow-400">{game.coins}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Fome:</span>
                      <p className="font-bold">{Math.round(game.hunger)}%</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Felicidade:</span>
                      <p className="font-bold">{Math.round(game.happiness)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Nenhum jogo salvo</p>
          )}
        </Card>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="font-bold mb-2">ℹ️ Informações</h3>
          <p className="text-slate-400 text-sm">
            Painel de administração para controlar o jogo CapyZen. Apenas usuários
            com permissão de administrador podem acessar este painel. Para solicitar
            acesso, entre em contato com o desenvolvedor.
          </p>
        </Card>
      </div>
    </div>
  );
}
