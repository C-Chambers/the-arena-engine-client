'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../context/GameContext';
import Link from 'next/link';

export default function PostGamePage() {
  const { postGameStats } = useGame();
  const router = useRouter();

  useEffect(() => {
    // If a user navigates here directly without finishing a game, redirect them.
    if (!postGameStats) {
      router.push('/dashboard');
    }
  }, [postGameStats, router]);

  if (!postGameStats) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading results...</div>;
  }
  
  const { finalState, newRating } = postGameStats;
  const myId = localStorage.getItem('myId'); // We need to know who "I" am
  const winnerId = Object.keys(finalState.players).find(id => finalState.players[id].team.every((c: any) => c.isAlive));
  const isVictory = myId === winnerId;

  return (
    <div className={`flex h-screen items-center justify-center ${isVictory ? 'bg-blue-900' : 'bg-red-900'}`}>
      <div className="text-center text-white bg-gray-800 p-12 rounded-xl shadow-2xl">
        <h1 className={`text-6xl font-bold mb-4 ${isVictory ? 'text-yellow-400' : 'text-gray-400'}`}>
          {isVictory ? 'VICTORY' : 'DEFEAT'}
        </h1>
        
        <p className="text-xl mb-8">{finalState.log[finalState.log.length - 1]}</p>

        {newRating && (
          <div className="bg-gray-700 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-2">Rank Update</h2>
            <p className="text-3xl font-mono">{Math.round(newRating.rating)} MMR</p>
            {/* We can add logic here to show MMR change, e.g., (+25) or (-18) */}
          </div>
        )}

        <Link href="/dashboard" className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg text-lg">
          Back to Main Menu
        </Link>
      </div>
    </div>
  );
}
