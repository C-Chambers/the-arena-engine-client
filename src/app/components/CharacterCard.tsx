'use client';

import { Character } from '../types'; // We'll create this type definition file next

interface CharacterCardProps {
  character: Character;
  isPlayer: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function CharacterCard({ character, isPlayer, isSelected, onClick }: CharacterCardProps) {
  const hpPercentage = (character.currentHp / character.maxHp) * 100;

  return (
    <div 
      className={`flex items-center gap-4 p-2 rounded-lg transition-all ${!character.isAlive ? 'opacity-40 bg-gray-700' : 'bg-gray-800'} ${onClick && character.isAlive ? 'cursor-pointer hover:ring-2 hover:ring-red-500' : ''} ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
      onClick={onClick}
    >
      {/* Portrait */}
      <div className="w-20 h-20 bg-gray-900 rounded-md flex items-center justify-center text-xs text-gray-400">
        [Portrait]
      </div>
      {/* Info */}
      <div className="flex-grow">
        <p className="font-bold text-lg">{character.name}</p>
        <div className="w-full bg-gray-600 rounded-full h-4 mt-1">
          <div 
            className="bg-green-500 h-4 rounded-full" 
            style={{ width: `${hpPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-right font-mono">{character.currentHp} / {character.maxHp}</p>
      </div>
    </div>
  );
}
