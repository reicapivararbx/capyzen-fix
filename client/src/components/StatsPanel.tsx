'use client';

import { GameState } from '@/types/game';

export default function StatsPanel({ gameState }: { gameState: GameState }) {
  const stats = [
    { label: '🍔 Fome', value: gameState.hunger, color: 'bg-orange-500' },
    { label: '❤️ Felicidade', value: gameState.happiness, color: 'bg-pink-500' },
    { label: '💩 Coco', value: gameState.poop, color: 'bg-yellow-700' },
    { label: '⚡ Energia', value: gameState.energy, color: 'bg-yellow-400' },
    { label: '💧 Sede', value: gameState.thirst, color: 'bg-blue-400' },
    { label: '🧴 Higiene', value: gameState.hygiene, color: 'bg-cyan-400' },
    { label: '❤️‍🩹 Saúde', value: gameState.health, color: 'bg-green-500' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-purple-400 overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold mb-4">👤 Jogador</h2>
      <div className="space-y-2 text-xs sm:text-sm mb-6">
        <p className="truncate">Nome: <span className="text-purple-300">{gameState.playerName}</span></p>
        <p>Nível: <span className="text-purple-300">{gameState.level}</span></p>
        <p>Moedas: 💰 <span className="text-yellow-300">{gameState.coins}</span></p>
        <p>Idade: <span className="text-purple-300">{gameState.age} dias</span></p>
      </div>

      <h2 className="text-lg sm:text-xl font-bold mb-4">📊 Capybara</h2>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="flex justify-between text-[10px] sm:text-xs mb-1">
              <span className="truncate mr-1">{stat.label}</span>
              <span className="shrink-0">{Math.round(stat.value)}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className={`${stat.color} h-2 rounded-full`} style={{ width: `${stat.value}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
