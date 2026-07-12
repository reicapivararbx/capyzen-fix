'use client';

import { Button } from '@/components/ui/button';

const ACTIONS = [
  { label: '🍖 Alimentar', action: 'feed' },
  { label: '🎾 Brincar', action: 'play' },
  { label: '💼 Trabalhar', action: 'work' },
  { label: '😴 Dormir', action: 'sleep' },
  { label: '🚿 Banho', action: 'bath' },
  { label: '🤗 Carinho', action: 'pet' },
];

export default function GameControls({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
      {ACTIONS.map((btn) => (
        <Button key={btn.action} onClick={() => onAction(btn.action)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold">
          {btn.label}
        </Button>
      ))}
    </div>
  );
}
