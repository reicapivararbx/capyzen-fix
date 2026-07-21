import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { loadGameState, saveGameState, updateGameState, DEFAULT_GAME_STATE } from "@/lib/game-save";
import type { GameState } from "@/types/game";

export default function Admin() {
  const [authStep, setAuthStep] = useState<"password" | "question" | "authenticated">("password");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [allGames, setAllGames] = useState<GameState[]>([]);

  // Senhas válidas
  const VALID_PASSWORDS = [
    "Can_u_please_give_me_adm",
    "capivarasdevemseradmsemtudo!",
    "307546",
    "admin123"
  ];

  // Pergunta de segurança
  const SECURITY_QUESTION = "Qual é o seu nome?";
  const CORRECT_ANSWER = "matteo"; // Você disse que não quer ser chamado por esse nome, mas é a resposta correta

  const handlePasswordSubmit = () => {
    if (VALID_PASSWORDS.includes(password)) {
      setPasswordError("");
      setAuthStep("question");
    } else {
      setPasswordError("Senha incorreta!");
      setPassword("");
    }
  };

  const handleQuestionSubmit = () => {
    const normalizedAnswer = questionAnswer.toLowerCase().trim();
    if (normalizedAnswer === CORRECT_ANSWER.toLowerCase()) {
      setQuestionError("");
      setAuthStep("authenticated");
      loadAllGames();
    } else {
      setQuestionError("Resposta incorreta!");
      setQuestionAnswer("");
    }
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
    alert(`✅ ${amount} moedas adicionadas!`);
  };

  const setMaxStats = () => {
    const state = loadGameState();
    if (!state.playerName && !state.capyName) {
      alert("Nenhum jogo salvo encontrado!");
      return;
    }
    const updated = updateGameState({
      hunger: 100,
      happiness: 100,
      energy: 100,
      health: 100,
      poop: 0,
      thirst: 100,
      hygiene: 100,
    });
    loadAllGames();
    alert("✅ Todos os stats foram maximizados!");
  };

  const levelUp = () => {
    const state = loadGameState();
    if (!state.playerName && !state.capyName) {
      alert("Nenhum jogo salvo encontrado!");
      return;
    }
    const updated = updateGameState({ level: state.level + 1, xp: 0 });
    setAllGames([updated]);
    alert("✅ Nível aumentado!");
  };

  // Tela de Senha
  if (authStep === "password") {
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
              onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />

            {passwordError && (
              <p className="text-red-400 text-sm text-center">{passwordError}</p>
            )}

            <Button
              onClick={handlePasswordSubmit}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              🔓 Próximo
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

  // Tela de Pergunta de Segurança
  if (authStep === "question") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">🔐 Verificação de Segurança</h1>
            <p className="text-slate-400">Responda a pergunta para continuar</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-300 font-semibold">{SECURITY_QUESTION}</p>
            </div>

            <input
              type="text"
              placeholder="Sua resposta"
              value={questionAnswer}
              onChange={(e) => setQuestionAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuestionSubmit()}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />

            {questionError && (
              <p className="text-red-400 text-sm text-center">{questionError}</p>
            )}

            <Button
              onClick={handleQuestionSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              ✅ Verificar
            </Button>

            <Button
              onClick={() => {
                setAuthStep("password");
                setPassword("");
                setQuestionAnswer("");
                setPasswordError("");
                setQuestionError("");
              }}
              variant="outline"
              className="w-full"
            >
              ← Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Painel Admin Autenticado
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
            <Button variant="outline" onClick={() => window.location.href = '/'}>🐹 Jogo</Button>
            <Link href="/loja">
              <Button variant="outline">🛍️ Loja</Button>
            </Link>
            <Button
              onClick={() => {
                setAuthStep("password");
                setPassword("");
                setQuestionAnswer("");
                setPasswordError("");
                setQuestionError("");
              }}
              variant="destructive"
            >
              🚺 Sair
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
                      <p className="font-bold">{game.playerName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Capivara:</span>
                      <p className="font-bold">{game.capyName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Nível:</span>
                      <p className="font-bold text-blue-400">
                        {game.level}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Moedas:</span>
                      <p className="font-bold text-yellow-400">
                        {game.coins}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Fome:</span>
                      <p className="font-bold">
                        {Math.round(game.hunger)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Felicidade:</span>
                      <p className="font-bold">
                        {Math.round(game.happiness)}%
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
            Sistema de autenticação com múltiplas senhas e pergunta de segurança.
          </p>
        </Card>
      </div>
    </div>
  );
}
