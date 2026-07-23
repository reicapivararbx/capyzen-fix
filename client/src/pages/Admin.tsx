import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { loadGameState, saveGameState, updateGameState, DEFAULT_GAME_STATE } from "@/lib/game-save";
import { useAuth } from "@/_core/hooks/useAuth";
import type { GameState } from "@/types/game";

export default function Admin() {
  const { user, loading } = useAuth();
  const [allGames, setAllGames] = useState<GameState[]>([]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadAllGames();
    }
  }, [user]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700 text-center">
          <h1 className="text-3xl mb-4">⚠️ Acesso Negado</h1>
          <p className="text-slate-400 mb-6">
            Você não tem permissão de administrador.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            {user ? `Logado como: ${user.username} (${user.role ?? "sem role"})` : "Não autenticado."}
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              🐹 Voltar ao Jogo
            </Button>
          </Link>
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
            <p className="text-slate-400">Logado como: {user.username}</p>
          </div>
          <nav className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = "/"}>🐹 Jogo</Button>
            <Link href="/loja">
              <Button variant="outline">🛍️ Loja</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">💬 Chat</Button>
            </Link>
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
            Painel de administração para controlar o jogo CapyZen. Acesso validado
            via role no servidor. Operações locais afetam apenas o estado do navegador.
          </p>
        </Card>
      </div>
    </div>
  );
}