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

    // Draw capybara - USANDO IMAGEM REAL
    drawCapybaraWithImage(ctx, capyX, capyY, gameState.equippedItems);

    // Draw name and level
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.capyName, capyX, capyY - 130);

    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText(`Lv${gameState.level}`, capyX, capyY - 110);
  }, [gameState, capyX, capyY]);

  // Draw capybara using the real image
  function drawCapybaraWithImage(ctx: CanvasRenderingContext2D, x: number, y: number, equippedItems: string[]) {
    const img = new Image();
    img.src = '/capybara.png';
    img.onload = () => {
      ctx.drawImage(img, x - 50, y - 50, 100, 100);
      equippedItems.forEach((item, idx) => {
        drawItemOnCapybara(ctx, x, y - 60 - (idx * 25), item);
      });
    };
  }

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

  // Draw realistic capybara based on the photo
  function drawCapybaraRealistic(ctx: CanvasRenderingContext2D, x: number, y: number, equippedItems: string[]) {
    // Corpo principal - GRANDE, RECHONCHUDO E FOFO
    ctx.fillStyle = '#D4C5B9'; // Bege claro
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 95, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barriga ainda mais clara
    ctx.fillStyle = '#E8DDD2';
    ctx.beginPath();
    ctx.ellipse(x, y + 25, 70, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça MUITO GRANDE - característica principal da capivara
    ctx.fillStyle = '#D4C5B9';
    ctx.beginPath();
    ctx.arc(x, y - 35, 70, 0, Math.PI * 2);
    ctx.fill();

    // Focinho GRANDE E ARREDONDADO - como na foto
    ctx.fillStyle = '#E8DDD2';
    ctx.beginPath();
    ctx.ellipse(x + 15, y - 20, 45, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // SEM ORELHAS VISÍVEIS (ou MUITO PEQUENAS)
    ctx.fillStyle = '#C4B5A0';
    ctx.beginPath();
    ctx.arc(x - 50, y - 65, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 50, y - 65, 8, 0, Math.PI * 2);
    ctx.fill();

    // Olhos PEQUENOS E REDONDOS (não grandes como antes)
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.arc(x - 10, y - 50, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 30, y - 50, 7, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 8, y - 52, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 32, y - 52, 3, 0, Math.PI * 2);
    ctx.fill();

    // Nariz GRANDE, AZULADO/CINZENTO - como na foto
    ctx.fillStyle = '#9BA8B5'; // Cinza azulado
    ctx.beginPath();
    ctx.ellipse(x + 20, y - 10, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Narinas
    ctx.fillStyle = '#6B7A8A';
    ctx.beginPath();
    ctx.arc(x + 12, y - 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 28, y - 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Boca - expressão dócil
    ctx.strokeStyle = '#9BA8B5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 20, y + 5, 12, 0, Math.PI, false);
    ctx.stroke();

    // Patas dianteiras - CURTAS E GROSSAS
    ctx.fillStyle = '#D4C5B9';
    ctx.fillRect(x - 60, y + 70, 32, 50);
    ctx.fillRect(x + 30, y + 70, 32, 50);

    // Patas traseiras - CURTAS E GROSSAS
    ctx.fillStyle = '#C4B5A0';
    ctx.fillRect(x - 70, y + 50, 25, 45);
    ctx.fillRect(x + 45, y + 50, 25, 45);

    // Cauda fofa
    ctx.strokeStyle = '#D4C5B9';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 85, y + 25);
    ctx.quadraticCurveTo(x - 150, y - 10, x - 120, y - 85);
    ctx.stroke();

    // Sombreado para profundidade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(x, y + 85, 95, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw equipped items
    if (equippedItems.includes('hat')) {
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(x, y - 105, 20, 0, Math.PI * 2);
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
    <canvas ref={canvasRef} width={560} height={400} className="w-full border-2 border-purple-400 rounded" />
  );
}
