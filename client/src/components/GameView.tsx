'use client';

import { useRef, useEffect } from 'react';
import { GameState } from '@/types/game';

interface GameViewProps {
  gameState: GameState;
  capyX: number;
  capyY: number;
}

// Deterministic pseudo-random based on seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Pre-compute stars for night sky
const STARS: { x: number; y: number; size: number; brightness: number }[] = [];
for (let i = 0; i < 60; i++) {
  STARS.push({
    x: seededRandom(i * 3 + 1) * 560,
    y: seededRandom(i * 3 + 2) * 120,
    size: seededRandom(i * 3 + 3) * 2 + 0.5,
    brightness: seededRandom(i * 7) * 0.5 + 0.5,
  });
}

// Pre-compute grass tufts
const GRASS_TUFTS: { x: number; y: number; h: number; lean: number }[] = [];
for (let i = 0; i < 40; i++) {
  GRASS_TUFTS.push({
    x: seededRandom(i * 5 + 10) * 560,
    y: 310 + seededRandom(i * 5 + 11) * 80,
    h: 8 + seededRandom(i * 5 + 12) * 14,
    lean: (seededRandom(i * 5 + 13) - 0.5) * 6,
  });
}

// Pre-computed scene elements
const STONES: { x: number; y: number; w: number; h: number; color: string }[] = [
  { x: 80, y: 365, w: 18, h: 12, color: '#8a8a7a' },
  { x: 150, y: 380, w: 12, h: 8, color: '#9a9a8a' },
  { x: 420, y: 370, w: 22, h: 14, color: '#7a7a6a' },
  { x: 480, y: 355, w: 10, h: 7, color: '#a0a090' },
  { x: 300, y: 385, w: 14, h: 9, color: '#888878' },
];

const FLOWERS: { x: number; y: number; color: string; size: number }[] = [
  { x: 100, y: 330, color: '#ff69b4', size: 5 },
  { x: 170, y: 345, color: '#ffb6c1', size: 4 },
  { x: 250, y: 325, color: '#ff1493', size: 5 },
  { x: 350, y: 340, color: '#ff69b4', size: 4 },
  { x: 440, y: 335, color: '#da70d6', size: 5 },
  { x: 500, y: 350, color: '#ffb6c1', size: 3 },
  { x: 60, y: 348, color: '#ff1493', size: 4 },
  { x: 310, y: 320, color: '#da70d6', size: 5 },
];

const TREES = [
  { x: 60, y: 220, trunkH: 80, canopyR: 45 },
  { x: 480, y: 200, trunkH: 100, canopyR: 55 },
  { x: 530, y: 240, trunkH: 60, canopyR: 35 },
];

const BUSHES = [
  { x: 130, y: 300, r: 20 },
  { x: 350, y: 295, r: 25 },
  { x: 450, y: 305, r: 18 },
];

const CLOUDS = [
  { x: 70, y: 55, size: 50 },
  { x: 220, y: 35, size: 65 },
  { x: 380, y: 60, size: 55 },
  { x: 500, y: 45, size: 45 },
];

function drawSky(ctx: CanvasRenderingContext2D, w: number, time: number) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 280);
  skyGrad.addColorStop(0, '#4a80b0');
  skyGrad.addColorStop(0.4, '#7ab0d8');
  skyGrad.addColorStop(0.8, '#a8d4f0');
  skyGrad.addColorStop(1, '#c8e4f8');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, 280);

  // Clouds
  for (const cloud of CLOUDS) {
    const drift = Math.sin(time * 0.0005 + cloud.x * 0.01) * 8;
    const cx = cloud.x + drift;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(cx - cloud.size * 0.3, cloud.y, cloud.size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cloud.y - 5, cloud.size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + cloud.size * 0.3, cloud.y, cloud.size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200, 220, 240, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cloud.y + 8, cloud.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sun
  const sunX = 460;
  const sunY = 65;
  const sunPulse = Math.sin(time * 0.001) * 2;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 45 + sunPulse);
  sunGlow.addColorStop(0, 'rgba(255, 220, 50, 0.4)');
  sunGlow.addColorStop(0.5, 'rgba(255, 200, 50, 0.15)');
  sunGlow.addColorStop(1, 'rgba(255, 180, 50, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 45 + sunPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
  ctx.beginPath();
  ctx.arc(sunX - 5, sunY - 5, 10, 0, Math.PI * 2);
  ctx.fill();

  // Distant hills
  ctx.fillStyle = 'rgba(80, 130, 80, 0.3)';
  ctx.beginPath();
  ctx.moveTo(0, 260);
  ctx.quadraticCurveTo(100, 220, 200, 250);
  ctx.quadraticCurveTo(350, 210, 450, 245);
  ctx.quadraticCurveTo(520, 225, 560, 255);
  ctx.lineTo(560, 280);
  ctx.lineTo(0, 280);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(60, 110, 60, 0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 270);
  ctx.quadraticCurveTo(80, 245, 180, 265);
  ctx.quadraticCurveTo(300, 235, 420, 260);
  ctx.quadraticCurveTo(500, 240, 560, 265);
  ctx.lineTo(560, 280);
  ctx.lineTo(0, 280);
  ctx.closePath();
  ctx.fill();
}

function drawTerrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grassGrad = ctx.createLinearGradient(0, 280, 0, h - 50);
  grassGrad.addColorStop(0, '#4a8c3f');
  grassGrad.addColorStop(0.3, '#3d7a34');
  grassGrad.addColorStop(0.7, '#5a9c4f');
  grassGrad.addColorStop(1, '#4a7c3f');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, 280, w, h - 330);

  // Dirt path
  ctx.strokeStyle = 'rgba(139, 115, 85, 0.4)';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 340);
  ctx.quadraticCurveTo(140, 320, 280, 350);
  ctx.quadraticCurveTo(420, 380, 560, 345);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(170, 145, 110, 0.3)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 340);
  ctx.quadraticCurveTo(140, 320, 280, 350);
  ctx.quadraticCurveTo(420, 380, 560, 345);
  ctx.stroke();

  // Mud patches
  ctx.fillStyle = 'rgba(120, 90, 60, 0.35)';
  ctx.beginPath();
  ctx.ellipse(200, 370, 40, 15, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(110, 85, 55, 0.3)';
  ctx.beginPath();
  ctx.ellipse(400, 360, 30, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawVegetation(ctx: CanvasRenderingContext2D, time: number) {
  // Trees
  for (const tree of TREES) {
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath();
    ctx.roundRect(tree.x - 8, tree.y, 16, tree.trunkH, 4);
    ctx.fill();
    ctx.fillStyle = '#4a2a10';
    ctx.beginPath();
    ctx.roundRect(tree.x - 3, tree.y + 10, 6, tree.trunkH - 20, 2);
    ctx.fill();

    const sway = Math.sin(time * 0.001 + tree.x * 0.01) * 2;
    ctx.fillStyle = '#2d6b1e';
    ctx.beginPath();
    ctx.arc(tree.x - 15 + sway, tree.y - 10, tree.canopyR * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a8a28';
    ctx.beginPath();
    ctx.arc(tree.x + 10 + sway, tree.y - 20, tree.canopyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a9a38';
    ctx.beginPath();
    ctx.arc(tree.x - 5 + sway, tree.y - 30, tree.canopyR * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(120, 200, 80, 0.2)';
    ctx.beginPath();
    ctx.arc(tree.x + 5 + sway, tree.y - 35, tree.canopyR * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bushes
  for (const bush of BUSHES) {
    ctx.fillStyle = '#3a7a2a';
    ctx.beginPath();
    ctx.arc(bush.x, bush.y, bush.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a8a3a';
    ctx.beginPath();
    ctx.arc(bush.x + 8, bush.y - 5, bush.r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(100, 180, 70, 0.25)';
    ctx.beginPath();
    ctx.arc(bush.x + 3, bush.y - 8, bush.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grass tufts
  for (const tuft of GRASS_TUFTS) {
    const sway = Math.sin(time * 0.002 + tuft.x * 0.05) * tuft.lean;
    ctx.strokeStyle = '#5aaa4a';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (let j = 0; j < 3; j++) {
      const offset = (j - 1) * 3;
      ctx.beginPath();
      ctx.moveTo(tuft.x + offset, tuft.y);
      ctx.quadraticCurveTo(tuft.x + offset + sway * 0.5, tuft.y - tuft.h * 0.6, tuft.x + offset + sway, tuft.y - tuft.h);
      ctx.stroke();
    }
  }

  // Flowers
  for (const flower of FLOWERS) {
    ctx.strokeStyle = '#3a7a2a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(flower.x, flower.y + 5);
    ctx.lineTo(flower.x, flower.y + 12);
    ctx.stroke();
    ctx.fillStyle = flower.color;
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(flower.x + Math.cos(angle) * flower.size, flower.y + Math.sin(angle) * flower.size, flower.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(flower.x, flower.y, flower.size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stones
  for (const stone of STONES) {
    ctx.fillStyle = stone.color;
    ctx.beginPath();
    ctx.ellipse(stone.x, stone.y, stone.w / 2, stone.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(stone.x - 2, stone.y - 2, stone.w / 4, stone.h / 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWater(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const waterY = h - 50;
  const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
  waterGrad.addColorStop(0, 'rgba(30, 100, 180, 0.7)');
  waterGrad.addColorStop(0.3, 'rgba(40, 120, 200, 0.8)');
  waterGrad.addColorStop(1, 'rgba(20, 80, 160, 0.9)');
  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.moveTo(0, waterY);
  for (let x = 0; x <= w; x += 4) {
    const wave = Math.sin(x * 0.02 + time * 0.002) * 3 + Math.sin(x * 0.05 + time * 0.003) * 1.5;
    ctx.lineTo(x, waterY + wave);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Reflections
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 8; i++) {
    const rx = seededRandom(i * 11) * w;
    const ry = waterY + 5 + seededRandom(i * 13) * 35;
    const shimmer = Math.sin(time * 0.003 + i) * 0.5 + 0.5;
    ctx.globalAlpha = shimmer * 0.3;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 15 + seededRandom(i * 17) * 25, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Shore line
  ctx.strokeStyle = 'rgba(100, 140, 80, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 4) {
    const wave = Math.sin(x * 0.02 + time * 0.002) * 3 + Math.sin(x * 0.05 + time * 0.003) * 1.5;
    if (x === 0) ctx.moveTo(x, waterY + wave);
    else ctx.lineTo(x, waterY + wave);
  }
  ctx.stroke();
}

function drawNightOverlay(ctx: CanvasRenderingContext2D, w: number) {
  const nightGrad = ctx.createLinearGradient(0, 0, 0, 280);
  nightGrad.addColorStop(0, 'rgba(10, 10, 40, 0.5)');
  nightGrad.addColorStop(0.5, 'rgba(20, 20, 60, 0.3)');
  nightGrad.addColorStop(1, 'rgba(30, 30, 80, 0.1)');
  ctx.fillStyle = nightGrad;
  ctx.fillRect(0, 0, w, 280);

  for (const star of STARS) {
    ctx.fillStyle = `rgba(255, 255, 220, ${star.brightness * 0.7})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(240, 240, 200, 0.9)';
  ctx.beginPath();
  ctx.arc(100, 55, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a80b0';
  ctx.beginPath();
  ctx.arc(108, 50, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawRain(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  ctx.strokeStyle = 'rgba(150, 180, 220, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    const rx = seededRandom(i * 7 + 100) * w;
    const ry = ((time * 0.3 + seededRandom(i * 7 + 101) * h) % (h + 20)) - 10;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 2, ry + 12);
    ctx.stroke();
  }
}

function drawFog(ctx: CanvasRenderingContext2D, w: number) {
  ctx.fillStyle = 'rgba(200, 210, 220, 0.15)';
  for (let i = 0; i < 5; i++) {
    const fx = seededRandom(i * 11 + 200) * w;
    const fy = 200 + seededRandom(i * 11 + 201) * 100;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 80 + seededRandom(i * 11 + 202) * 60, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCapybara(ctx: CanvasRenderingContext2D, x: number, y: number, equippedItems: string[]) {
  const bobY = Math.sin(Date.now() * 0.003) * 2;
  const walkBob = Math.abs(Math.sin(Date.now() * 0.006)) * 3;
  const isMoving = equippedItems.includes('moving');

  const drawY = isMoving ? y + walkBob : y + bobY;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.beginPath();
  ctx.ellipse(x, drawY + 88, 62, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const isAstronaut = equippedItems.includes('skin_astronaut');
  const isPirate = equippedItems.includes('skin_pirate');
  const isMage = equippedItems.includes('skin_mage');
  const isKnight = equippedItems.includes('skin_knight');
  const isNinja = equippedItems.includes('skin_ninja');

  let bodyColor = '#D4B896';
  let bellyColor = '#E8D5BF';
  let feetColor = '#B89B78';

  if (isAstronaut) { bodyColor = '#E0E0E0'; bellyColor = '#F5F5F5'; feetColor = '#C0C0C0'; }
  if (isPirate) { bodyColor = '#8B4513'; bellyColor = '#D2691E'; feetColor = '#5C3317'; }
  if (isMage) { bodyColor = '#4B0082'; bellyColor = '#6A0DAD'; feetColor = '#2E0854'; }
  if (isKnight) { bodyColor = '#808080'; bellyColor = '#A9A9A9'; feetColor = '#696969'; }
  if (isNinja) { bodyColor = '#1C1C1C'; bellyColor = '#2F2F2F'; feetColor = '#0D0D0D'; }

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, drawY + 30, 58, 48, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = bellyColor;
  ctx.beginPath();
  ctx.ellipse(x, drawY + 35, 40, 33, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = feetColor;
  ctx.beginPath();
  ctx.ellipse(x - 33, drawY + 72, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 33, drawY + 72, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = feetColor;
  ctx.beginPath();
  ctx.ellipse(x - 33, drawY + 80, 13, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 33, drawY + 80, 13, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(x, drawY - 25, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = feetColor;
  ctx.beginPath();
  ctx.ellipse(x - 43, drawY - 63, 11, 9, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = bellyColor;
  ctx.beginPath();
  ctx.ellipse(x - 43, drawY - 63, 6, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = feetColor;
  ctx.beginPath();
  ctx.ellipse(x + 43, drawY - 63, 11, 9, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = bellyColor;
  ctx.beginPath();
  ctx.ellipse(x + 43, drawY - 63, 6, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  if (isNinja) {
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.ellipse(x - 12, drawY - 30, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 26, drawY - 30, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(x + 8, drawY - 8, 33, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 12, drawY - 32, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 26, drawY - 32, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.ellipse(x - 14, drawY - 30, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 24, drawY - 30, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 17, drawY - 34, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 21, drawY - 34, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isPirate ? '#5C3317' : '#8B7B6B';
    ctx.beginPath();
    ctx.ellipse(x + 8, drawY - 6, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isPirate ? '#3C1A00' : '#A89888';
    ctx.beginPath();
    ctx.arc(x + 6, drawY - 8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isPirate ? '#3C1A00' : '#8B7B6B';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, drawY + 4, 13, 0.15, Math.PI - 0.15, false);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x - 28, drawY - 8, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 38, drawY - 8, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isAstronaut) {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, drawY - 25, 62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(180, 220, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(x, drawY - 25, 62, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isPirate) {
    ctx.fillStyle = '#1C1C1C';
    ctx.beginPath();
    ctx.moveTo(x - 40, drawY - 80);
    ctx.lineTo(x + 40, drawY - 80);
    ctx.lineTo(x + 50, drawY - 72);
    ctx.lineTo(x - 30, drawY - 72);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, drawY - 76, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isMage) {
    ctx.fillStyle = '#4B0082';
    ctx.beginPath();
    ctx.moveTo(x - 25, drawY - 85);
    ctx.lineTo(x, drawY - 130);
    ctx.lineTo(x + 25, drawY - 85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, drawY - 130, 5, 0, Math.PI * 2);
    ctx.fill();
    const starGlow = Math.sin(Date.now() * 0.005) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(255, 215, 0, ${starGlow})`;
    ctx.beginPath();
    ctx.arc(x, drawY - 130, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isKnight) {
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(x, drawY - 85, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#696969';
    ctx.fillRect(x - 5, drawY - 65, 10, 8);
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(x, drawY - 90, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const item of equippedItems) {
    if (item === 'hat_cowboy') {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 35, drawY - 92, 70, 8);
      ctx.fillRect(x - 18, drawY - 110, 36, 20);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x - 18, drawY - 95, 36, 3);
    }
    if (item === 'hat_crown') {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(x - 22, drawY - 85);
      ctx.lineTo(x - 15, drawY - 105);
      ctx.lineTo(x - 8, drawY - 85);
      ctx.lineTo(x, drawY - 110);
      ctx.lineTo(x + 8, drawY - 85);
      ctx.lineTo(x + 15, drawY - 105);
      ctx.lineTo(x + 22, drawY - 85);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(x, drawY - 92, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (item === 'hat_winter') {
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(x, drawY - 80, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - 22, drawY - 82, 44, 6);
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(x, drawY - 102, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (item === 'hat_wizard') {
      ctx.fillStyle = '#4B0082';
      ctx.beginPath();
      ctx.moveTo(x - 20, drawY - 85);
      ctx.lineTo(x, drawY - 125);
      ctx.lineTo(x + 20, drawY - 85);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, drawY - 125, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (item === 'hat_space') {
      ctx.fillStyle = '#E0E0E0';
      ctx.beginPath();
      ctx.arc(x, drawY - 80, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(180, 220, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(x, drawY - 80, 24, 0, Math.PI * 2);
      ctx.fill();
    }
    if (item === 'glasses_sunglasses') {
      ctx.fillStyle = '#1C1C1C';
      ctx.fillRect(x - 25, drawY - 38, 18, 12);
      ctx.fillRect(x + 12, drawY - 38, 18, 12);
      ctx.fillStyle = '#333';
      ctx.fillRect(x - 7, drawY - 34, 14, 3);
    }
    if (item === 'glasses_round') {
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x - 14, drawY - 30, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 24, drawY - 30, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4, drawY - 30);
      ctx.lineTo(x + 14, drawY - 30);
      ctx.stroke();
    }
    if (item === 'glasses_swim') {
      ctx.strokeStyle = '#00BFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x - 14, drawY - 30, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 24, drawY - 30, 11, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (item === 'glasses_futuristic') {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.3)';
      ctx.fillRect(x - 28, drawY - 38, 58, 14);
      ctx.strokeStyle = '#00FF64';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 28, drawY - 38, 58, 14);
    }
    if (item === 'necklace_teeth') {
      ctx.strokeStyle = '#C0C0C0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, drawY + 50, 25, 10, 0, 0, Math.PI);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const nx = x - 20 + i * 10;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(nx, drawY + 50);
        ctx.lineTo(nx + 3, drawY + 60);
        ctx.lineTo(nx - 3, drawY + 60);
        ctx.closePath();
        ctx.fill();
      }
    }
    if (item === 'necklace_pearls') {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, drawY + 50, 25, 10, 0, 0, Math.PI);
      ctx.stroke();
      for (let i = 0; i < 7; i++) {
        const angle = (i / 6) * Math.PI;
        const px = x - 25 + i * 8.3;
        const py = drawY + 50 + Math.sin(angle) * 10;
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (item === 'necklace_skulls') {
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, drawY + 50, 25, 10, 0, 0, Math.PI);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const sx = x - 15 + i * 15;
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath();
        ctx.arc(sx, drawY + 55, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(sx - 2, drawY + 53, 1.5, 2);
        ctx.fillRect(sx + 0.5, drawY + 53, 1.5, 2);
      }
    }
    if (item === 'necklace_star') {
      ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(Date.now() * 0.003) * 0.3})`;
      ctx.beginPath();
      const starX = x;
      const starY = drawY + 55;
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? 8 : 4;
        if (i === 0) ctx.moveTo(starX + r * Math.cos(angle), starY + r * Math.sin(angle));
        else ctx.lineTo(starX + r * Math.cos(angle), starY + r * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    if (item === 'hat') {
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(x, drawY - 85, 17, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fallback: generic cosmetic items get a colored badge
    const catColor: Record<string, string> = {
      clothing_shirt: '#3B82F6',
      clothing_pants: '#22C55E',
      clothing_shoes: '#92400E',
      clothing_generic: '#6B7280',
      accessory_watch: '#F59E0B',
      accessory_bag: '#F97316',
      accessory_bracelet: '#A855F7',
      accessory_ring: '#EAB308',
      accessory_generic: '#FBBF24',
      hat_generic: '#8B5CF6',
      glasses_generic: '#06B6D4',
      necklace_generic: '#FCD34D',
    };
    const catLabel: Record<string, string> = {
      clothing_shirt: '👕', clothing_pants: '👖', clothing_shoes: '👟',
      clothing_generic: '👕', accessory_watch: '⌚', accessory_bag: '👜',
      accessory_bracelet: '📿', accessory_ring: '💍', accessory_generic: '✨',
      hat_generic: '🎩', glasses_generic: '👓', necklace_generic: '📿',
    };
    for (const [prefix, color] of Object.entries(catColor)) {
      if (item.startsWith(prefix)) {
        ctx.fillStyle = color + 'CC';
        ctx.beginPath();
        ctx.arc(x + 40, drawY - 60, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
      }
    }
  }
}

export default function GameView({ gameState, capyX, capyY }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width ?? 560;
    const h = rect?.height ?? 400;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const time = Date.now();
    ctx.clearRect(0, 0, w, h);

    drawSky(ctx, w, time);
    drawTerrain(ctx, w, h);
    drawVegetation(ctx, time);
    drawWater(ctx, w, h, time);
    drawNightOverlay(ctx, w);
    drawRain(ctx, w, h, time);
    drawFog(ctx, w);
    drawCapybara(ctx, capyX, capyY, gameState.equippedItems);

    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.capyName, capyX, capyY - 100);
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText(`Lv${gameState.level}`, capyX, capyY - 82);
  }, [gameState, capyX, capyY]);

  return (
    <canvas ref={canvasRef} className="w-full h-full rounded-lg border-2 border-green-600/40" />
  );
}
