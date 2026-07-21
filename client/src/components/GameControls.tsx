'use client';

import { Button } from '@/components/ui/button';

const ACTIONS = [
  { label: '🍖 Alimentar', action: 'feed', color: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20' },
  { label: '🎾 Brincar', action: 'play', color: 'from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/20' },
  { label: '💼 Trabalhar', action: 'work', color: 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/20' },
  { label: '😴 Dormir', action: 'sleep', color: 'from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-purple-500/20' },
  { label: '🚿 Banho', action: 'bath', color: 'from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-cyan-500/20' },
  { label: '🤗 Carinho', action: 'pet', color: 'from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-500/20' },
];

export default function GameControls({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {ACTIONS.map((btn) => (
        <Button key={btn.action} onClick={() => onAction(btn.action)} className={`bg-gradient-to-r ${btn.color} text-white font-bold min-h-[52px] rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg`}>
          {btn.label}
        </Button>
      ))}
    </div>
  );
}
