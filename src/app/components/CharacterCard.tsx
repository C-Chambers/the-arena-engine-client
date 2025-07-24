'use client';

import { Character, StatusEffect } from '../types'; 
import Image from 'next/image';

interface CharacterCardProps {
  character: Character;
  isPlayer: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function CharacterCard({ character, isPlayer, isSelected, onClick }: CharacterCardProps) {
  const hpPercentage = (character.currentHp / character.maxHp) * 100;
  const isInvulnerable = character.statuses?.some((s: any) => s.status === 'invulnerable');
  
  // DEBUG: Log when a character has invulnerable status
  if (isInvulnerable) {
    console.log(`DEBUG CLIENT: ${character.name} is invulnerable, statuses:`, character.statuses);
  }

  return (
    <div 
      className={`flex items-center gap-4 p-2 rounded-lg transition-all ${!character.isAlive ? 'opacity-40 bg-gray-700' : isInvulnerable ? 'bg-blue-900 border-2 border-blue-400' : 'bg-gray-800'} ${onClick && character.isAlive && !isInvulnerable ? 'cursor-pointer hover:ring-2 hover:ring-red-500' : isInvulnerable ? 'cursor-not-allowed' : ''} ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
      onClick={onClick}
    >
      {/* Portrait */}
      <div className="w-20 h-20 bg-gray-900 rounded-md flex-shrink-0 flex items-center justify-center text-xs text-gray-400 relative">
        {character.imageUrl ? (
          <Image src={character.imageUrl} alt={character.name} layout="fill" objectFit="cover" className="rounded-md" />
        ) : (
          <span>[P]</span>
        )}
      </div>
      {/* Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-lg truncate">{character.name}</p>
            {/* --- Status Icon Container --- */}
            <div className="flex gap-1.5">
                {character.statuses && character.statuses.map((status: StatusEffect, index: number) => {
                    // DEBUG: Log all statuses for invulnerable characters
                    if (status.status === 'invulnerable') {
                        console.log(`DEBUG CLIENT: Found invulnerable status on ${character.name}:`, status);
                    }
                    
                    // Ensure the status has the required info before rendering
                    if (status.sourceSkill && status.sourceSkill.iconUrl) {
                        return (
                            <div key={index} className="relative w-6 h-6" title={`${status.status} - ${status.duration} turns left`}>
                                <Image src={status.sourceSkill.iconUrl} alt={status.sourceSkill.name} layout="fill" className="rounded-sm" />
                                <div className="absolute -bottom-1 -right-1 bg-black bg-opacity-80 rounded-full text-white text-xs font-bold w-4 h-4 flex items-center justify-center pointer-events-none">
                                    {status.duration}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
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
