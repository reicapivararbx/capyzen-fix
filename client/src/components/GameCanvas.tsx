import { useEffect, useRef } from 'react';
import type { GameState } from '@/types/game';

interface GameCanvasProps {
  state: GameState;
  stateRef: React.MutableRefObject<GameState | undefined>;
  onKeyDown: (e: KeyboardEvent) => void;
}

/**
 * Componente para renderizar o canvas do jogo
 * Separado do Home.tsx para melhor manutenção
 */
export function GameCanvas({ state, stateRef, onKeyDown }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Desenhar capivara
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = stateRef.current || state;

    // Limpar canvas
    ctx.fillStyle = '#e0f7ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar capivara
    const x = currentState.x;
    const y = currentState.y;
    const size = currentState.capySize;

    // Corpo
    ctx.fillStyle = currentState.capyColor;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça
    ctx.beginPath();
    ctx.ellipse(x + size * 0.35, y - size * 0.3, size * 0.4, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olho esquerdo
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + size * 0.15, y - size * 0.45, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Olho direito
    ctx.beginPath();
    ctx.arc(x + size * 0.55, y - size * 0.45, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + size * 0.2, y - size * 0.5, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.6, y - size * 0.5, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Nariz
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + size * 0.35, y - size * 0.15, size * 0.1, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Boca
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + size * 0.35, y, size * 0.15, 0, Math.PI);
    ctx.stroke();

    // Orelhas
    ctx.fillStyle = currentState.capyColor;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.05, y - size * 0.6, size * 0.15, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.65, y - size * 0.6, size * 0.15, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Patas
    ctx.beginPath();
    ctx.ellipse(x - size * 0.3, y + size * 0.4, size * 0.12, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.3, y + size * 0.4, size * 0.12, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // Desenhar barrinhas de status
  const drawBars = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = stateRef.current || state;

    const barWidth = 120;
    const barHeight = 16;
    const startX = 10;
    const startY = 10;
    const spacing = 22;

    const bars = [
      { label: '🍽️', value: Math.max(0, 100 - currentState.hunger), color: '#10b981', max: 100 },
      { label: '😄', value: currentState.happiness, color: '#f59e0b', max: 100 },
      { label: '💩', value: Math.min(100, currentState.poop), color: '#8b7355', max: 100 },
      { label: '🔴', value: currentState.sus, color: '#ef4444', max: 100 },
    ];

    bars.forEach((bar, i) => {
      const y = startY + i * spacing;

      // Background
      ctx.fillStyle = '#ddd';
      ctx.fillRect(startX, y, barWidth, barHeight);

      // Bar
      ctx.fillStyle = bar.color;
      ctx.fillRect(startX, y, (bar.value / bar.max) * barWidth, barHeight);

      // Border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(bar.label, startX - 20, y + 12);
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(bar.value)}%`, startX + barWidth + 5, y + 12);
    });
  };

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      draw();
      drawBars();
    }, 1000 / 30);

    const keyHandler = (e: KeyboardEvent) => {
      onKeyDown(e);
    };

    window.addEventListener('keydown', keyHandler);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="border-4 border-pink-400 rounded-2xl bg-gradient-to-b from-sky-200 to-sky-100 shadow-lg"
    />
  );
}
