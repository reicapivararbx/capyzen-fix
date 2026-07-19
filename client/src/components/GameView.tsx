'use client';

import { useRef, useEffect } from 'react';
import { GameState } from '@/types/game';

interface GameViewProps {
  gameState: GameState;
  capyX: number;
  capyY: number;
}

export default function GameView({ gameState, capyX, capyY }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8BA3D9');
    gradient.addColorStop(1, '#C5D9F0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawCloud(ctx, 80, 60, 70, '#FFFFFF');
    drawCloud(ctx, 320, 100, 90, '#FFFFFF');
    drawCloud(ctx, 480, 50, 75, '#FFFFFF');

    // Draw sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(500, 80, 35, 0, Math.PI * 2);
    ctx.fill();

    // Draw tree
    ctx.fillStyle = '#2D5016';
    ctx.beginPath();
    ctx.arc(450, 200, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#654321';
    ctx.fillRect(430, 250, 40, 100);

    // Draw grass
    ctx.fillStyle = '#5FD068';
    ctx.fillRect(0, 350, canvas.width, 150);

    // Draw flowers
    drawFlower(ctx, 100, 330, '#FF69B4');
    drawFlower(ctx, 200, 340, '#FFB6C1');
    drawFlower(ctx, 350, 320, '#FF69B4');
    drawFlower(ctx, 480, 330, '#FFB6C1');

    // Draw capybara - procedurally drawn
    drawCapybaraRealistic(ctx, capyX, capyY, gameState.equippedItems);

    // Draw name and level
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.capyName, capyX, capyY - 130);

    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText(`Lv${gameState.level}`, capyX, capyY - 110);
  }, [gameState, capyX, capyY]);

  function drawItemOnCapybara(ctx: CanvasRenderingContext2D, x: number, y: number, item: string) {
    if (item.includes('food')) {
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(x + 30, y, 12, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.includes('hat')) {
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.ellipse(x, y - 55, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCapybaraRealistic(ctx: CanvasRenderingContext2D, x: number, y: number, equippedItems: string[]) {
    ctx.fillStyle = '#C4A882';
    ctx.beginPath();
    ctx.ellipse(x - 68, y + 15, 10, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#D4B896';
    ctx.beginPath();
    ctx.ellipse(x, y + 30, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E8D5BF';
    ctx.beginPath();
    ctx.ellipse(x, y + 35, 42, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C4A882';
    ctx.beginPath();
    ctx.ellipse(x - 35, y + 72, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 35, y + 72, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#B89B78';
    ctx.beginPath();
    ctx.ellipse(x - 35, y + 80, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 35, y + 80, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#D4B896';
    ctx.beginPath();
    ctx.arc(x, y - 25, 62, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E8C8A8';
    ctx.beginPath();
    ctx.ellipse(x - 35, y - 10, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 35, y - 10, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E8D5BF';
    ctx.beginPath();
    ctx.ellipse(x + 10, y - 8, 35, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C4A882';
    ctx.beginPath();
    ctx.ellipse(x - 45, y - 65, 12, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E8C8A8';
    ctx.beginPath();
    ctx.ellipse(x - 45, y - 65, 7, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C4A882';
    ctx.beginPath();
    ctx.ellipse(x + 45, y - 65, 12, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E8C8A8';
    ctx.beginPath();
    ctx.ellipse(x + 45, y - 65, 7, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.ellipse(x - 15, y - 30, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 25, y - 30, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 12, y - 33, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 28, y - 33, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 18, y - 27, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 22, y - 27, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8B7B6B';
    ctx.beginPath();
    ctx.ellipse(x + 10, y - 8, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#A89888';
    ctx.beginPath();
    ctx.arc(x + 8, y - 10, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8B7B6B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y + 2, 14, 0.15, Math.PI - 0.15, false);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 150, 150, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x - 30, y - 10, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 40, y - 10, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.ellipse(x, y + 88, 65, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw equipped items
    if (equippedItems.includes('hat')) {
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(x, y - 87, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw cloud
  function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - size / 2, y, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size / 2, y, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw flower
  function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x + Math.cos((i / 5) * Math.PI * 2) * 8, y + Math.sin((i / 5) * Math.PI * 2) * 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  return (
    <canvas ref={canvasRef} width={560} height={400} className="w-full h-full border-2 border-purple-400 rounded" />
  );
}
