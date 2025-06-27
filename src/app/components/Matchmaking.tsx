'use client';

import { useGame } from '../context/GameContext';

export default function Matchmaking() {
  const { connectAndFindMatch, statusMessage } = useGame();

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-semibold mb-4 text-white">Find a Match</h2>
      <p className="text-gray-300 mb-6 h-6">{statusMessage}</p>
      <button 
        onClick={connectAndFindMatch}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
      >
        Play Game
      </button>
    </div>
  );
}
