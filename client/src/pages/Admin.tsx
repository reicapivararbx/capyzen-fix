import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [allGames, setAllGames] = useState<any[]>([]);

  const ADMIN_PASSWORD = "admin123";

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
      loadAllGames();
    } else {
      setPasswordError("Senha incorreta!");
    }
  };

  const loadAllGames = () => {
    try {
      const saved = localStorage.getItem("capyzen_game");
      if (saved) {
        const game = JSON.parse(saved);
        setAllGames([game]);
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    }
  };

  const resetAllData = () => {
    if (confirm("Tem certeza que deseja resetar TODOS os dados?")) {
      localStorage.removeItem("capyzen_game");
      setAllGames([]);
      alert("Todos os dados foram deletados!");
    }
  };

  const giveCoins = (amount: number) => {
    try {
      const saved = localStorage.getItem("capyzen_game");
      if (saved) {
        const game = JSON.parse(saved);
        game.player.coins += amount;
        localStorage.setItem("capyzen_game", JSON.stringify(game));
        loadAllGames();
        alert(`✅ ${amount} moedas adicionadas!`);
      }
    } catch (e) {
      console.error("Erro:", e);
    }
  };

  const setMaxStats = () => {
    try {
      const saved = localStorage.getItem("capyzen_game");
      if (saved) {
        const game = JSON.parse(saved);
        game.capybara.hunger = 100;
        game.capybara.happiness = 100;
        game.capybara.energy = 100;
        game.capybara.health = 100;
        localStorage.setItem("capyzen_game", JSON.stringify(game));
        loadAllGames();
        alert("✅ Todos os stats foram maximizados!");
      }
    } catch (e) {
      console.error("Erro:", e);
    }
  };

  const levelUp = () => {
    try {
      const saved = localStorage.getItem("capyzen_game");
      if (saved) {
        const game = JSON.parse(saved);
        game.player.level += 1;
        game.player.xp = 0;
        localStorage.setItem("capyzen_game", JSON.stringify(game));
        loadAllGames();
        alert("✅ Nível aumentado!");
      }
    } catch (e) {
      console.error("Erro:", e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">⚙️ Painel Admin</h1>
            <p className="text-slate-400">Digite a senha para acessar</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />

            {passwordError && (
              <p className="text-red-400 text-sm text-center">{passwordError}</p>
            )}

            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              🔓 Acessar Admin
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
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">⚙️ Painel Admin</h1>
            <p className="text-slate-400">Controle total do jogo</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="outline">🐹 Jogo</Button>
            </Link>
            <Link href="/loja">
              <Button variant="outline">🛍️ Loja</Button>
            </Link>
            <Button
              onClick={() => setIsAuthenticated(false)}
              variant="destructive"
            >
              🚪 Sair
            </Button>
          </nav>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commands */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">🎮 Comandos</h2>
          <div className="space-y-3">
            <Button
              onClick={() => giveCoins(500)}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              💰 Adicionar 500 Moedas
            </Button>
            <Button
              onClick={() => giveCoins(1000)}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              💰 Adicionar 1000 Moedas
            </Button>
            <Button
              onClick={setMaxStats}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              ✅ Maximizar Stats
            </Button>
            <Button
              onClick={levelUp}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              📈 Subir de Nível
            </Button>
            <Button
              onClick={resetAllData}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              🗑️ Deletar Todos os Dados
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">📊 Estatísticas</h2>
          {allGames.length > 0 ? (
            <div className="space-y-4">
              {allGames.map((game, idx) => (
                <div key={idx} className="bg-slate-700 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Jogador:</span>
                      <p className="font-bold">{game.player.username}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Capivara:</span>
                      <p className="font-bold">{game.player.capyName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Nível:</span>
                      <p className="font-bold text-blue-400">
                        {game.player.level}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Moedas:</span>
                      <p className="font-bold text-yellow-400">
                        {game.player.coins}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Fome:</span>
                      <p className="font-bold">
                        {Math.round(game.capybara.hunger)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Felicidade:</span>
                      <p className="font-bold">
                        {Math.round(game.capybara.happiness)}%
                      </p>
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

      {/* Info */}
      <div className="max-w-7xl mx-auto mt-6">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="font-bold mb-2">ℹ️ Informações</h3>
          <p className="text-slate-400 text-sm">
            Painel de administração para controlar o jogo CapyZen. Aqui você pode
            adicionar moedas, maximizar stats, subir de nível e resetar dados.
          </p>
        </Card>
      </div>
    </div>
  );
}
