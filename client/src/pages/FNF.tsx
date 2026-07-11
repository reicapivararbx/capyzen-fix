import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface Note {
  id: number;
  time: number;
  lane: number;
  hit: boolean;
}

interface GameStats {
  score: number;
  combo: number;
  health: number;
}

export default function FNF() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    combo: 0,
    health: 100,
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Gerar notas para a música
  const generateNotes = () => {
    const newNotes: Note[] = [];
    for (let i = 0; i < 50; i++) {
      newNotes.push({
        id: i,
        time: i * 0.5,
        lane: Math.floor(Math.random() * 4),
        hit: false,
      });
    }
    setNotes(newNotes);
  };

  // Iniciar jogo
  const startGame = () => {
    generateNotes();
    setGameStarted(true);
    setGameStats({ score: 0, combo: 0, health: 100 });
    setGameOver(false);
    setWon(false);
    setCurrentTime(0);
    startTimeRef.current = Date.now();

    // Game loop
    gameLoopRef.current = setInterval(() => {
      setCurrentTime((Date.now() - startTimeRef.current) / 1000);
    }, 16);
  };

  // Detectar tecla pressionada com eventos otimizados
  useEffect(() => {
    if (!gameStarted || gameOver || won) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        'a': 0, 'A': 0,
        's': 1, 'S': 1,
        'd': 2, 'D': 2,
        'f': 3, 'F': 3,
      };

      const lane = keyMap[e.key];
      if (lane === undefined) return;

      e.preventDefault();

      // Verificar se acertou uma nota
      const hitNote = notes.find(
        (n) =>
          !n.hit &&
          n.lane === lane &&
          Math.abs(n.time - currentTime) < 0.2
      );

      if (hitNote) {
        setNotes((prev) =>
          prev.map((n) => (n.id === hitNote.id ? { ...n, hit: true } : n))
        );
        setGameStats((prev) => ({
          ...prev,
          score: prev.score + 100,
          combo: prev.combo + 1,
        }));
      } else {
        setGameStats((prev) => ({
          ...prev,
          combo: 0,
          health: Math.max(0, prev.health - 10),
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, won, notes, currentTime]);

  // Verificar game over
  useEffect(() => {
    if (gameStats.health <= 0) {
      setGameOver(true);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, [gameStats.health]);

  // Verificar vitória
  useEffect(() => {
    if (gameStarted && notes.length > 0 && notes.every((n) => n.hit)) {
      setWon(true);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, [notes, gameStarted]);

  // Desenhar jogo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar pistas
    const laneWidth = canvas.width / 4;
    const laneY = canvas.height - 150;

    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#2a2a4e' : '#1f1f3a';
      ctx.fillRect(i * laneWidth, 0, laneWidth, canvas.height);

      // Desenhar receptor de notas
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(i * laneWidth + 10, laneY, laneWidth - 20, 80);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(i * laneWidth + 10, laneY, laneWidth - 20, 80);
    }

    // Desenhar notas
    notes.forEach((note) => {
      if (note.hit) return;

      const x = note.lane * laneWidth + laneWidth / 2;
      const y = laneY - (currentTime - note.time) * 200;

      if (y < -50 || y > canvas.height) return;

      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Desenhar capivara vs inimigo
    const capyX = 50;
    const capyY = 50;

    // Capivara (esquerda)
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.ellipse(capyX, capyY, 30, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olhos da capivara
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(capyX - 10, capyY - 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(capyX + 10, capyY - 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Inimigo (direita)
    const enemyX = canvas.width - 50;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.ellipse(enemyX, capyY, 30, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olhos do inimigo
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(enemyX - 10, capyY - 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemyX + 10, capyY - 10, 5, 0, Math.PI * 2);
    ctx.fill();
  }, [notes, currentTime, gameStarted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🎵 CapyZen FNF</h1>
            <p className="text-white/80">Batalhe com sua capivara ao ritmo da música!</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="outline">🐹 Jogo</Button>
            </Link>
            <Link href="/loja">
              <Button variant="outline">🛍️ Loja</Button>
            </Link>
          </nav>
        </div>

        {/* Game Container */}
        <div className="bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full bg-slate-800"
          />

          {/* Stats */}
          <div className="p-6 bg-slate-800 border-t border-slate-700">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Pontuação</p>
                <p className="text-2xl font-bold text-white">{gameStats.score}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Combo</p>
                <p className="text-2xl font-bold text-yellow-400">{gameStats.combo}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Saúde</p>
                <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${gameStats.health}%` }}
                  />
                </div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Tempo</p>
                <p className="text-2xl font-bold text-white">{currentTime.toFixed(1)}s</p>
              </div>
            </div>

            {/* Controles */}
            <div className="text-center mb-6">
              <p className="text-white text-lg mb-3">Pressione as teclas: <span className="font-bold">A S D F</span></p>
              <div className="flex gap-2 justify-center">
                <div className="bg-blue-600 px-4 py-2 rounded text-white font-bold">A</div>
                <div className="bg-blue-600 px-4 py-2 rounded text-white font-bold">S</div>
                <div className="bg-blue-600 px-4 py-2 rounded text-white font-bold">D</div>
                <div className="bg-blue-600 px-4 py-2 rounded text-white font-bold">F</div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 justify-center">
              {!gameStarted && (
                <Button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  🎮 Começar Batalha
                </Button>
              )}

              {gameOver && (
                <div className="text-center w-full">
                  <p className="text-3xl font-bold text-red-500 mb-4">💔 Game Over!</p>
                  <Button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  >
                    🔄 Tentar Novamente
                  </Button>
                </div>
              )}

              {won && (
                <div className="text-center w-full">
                  <p className="text-3xl font-bold text-green-500 mb-4">🎉 Vitória!</p>
                  <p className="text-white text-xl mb-4">Pontuação Final: {gameStats.score}</p>
                  <Button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  >
                    🔄 Jogar Novamente
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-slate-800 p-6 rounded-lg text-white">
          <h3 className="text-xl font-bold mb-4">📖 Como Jogar:</h3>
          <ul className="space-y-2">
            <li>✅ Pressione as teclas <span className="font-bold">A S D F</span> quando as notas chegarem ao receptor</li>
            <li>✅ Acerte as notas para ganhar pontos e aumentar o combo</li>
            <li>✅ Errar as notas reduz sua saúde</li>
            <li>✅ Acerte todas as notas para vencer a batalha!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
