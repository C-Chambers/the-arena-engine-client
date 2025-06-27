'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../context/GameContext';
import CombatDisplay from '../components/CombatDisplay';

export default function BattlePage() {
  const { gameState } = useGame();
  const router = useRouter();

  useEffect(() => {
    // If there's no game state, the user shouldn't be here. Redirect them.
    if (!gameState) {
      router.push('/dashboard');
    }
  }, [gameState, router]);

  if (!gameState) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-900">
            <p className="text-white text-xl">Loading game...</p>
        </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-800 p-4 flex items-center justify-center">
      <CombatDisplay />
    </div>
  );
}
