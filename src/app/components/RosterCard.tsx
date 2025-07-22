'use client';

import { Character } from '../types';
import Image from 'next/image';

interface RosterCardProps {
  character: Character;
  isExpanded: boolean; // NEW: Prop to control expansion
  onToggle: () => void;   // NEW: Prop to notify the parent of a click
}

export default function RosterCard({ character, isExpanded, onToggle }: RosterCardProps) {
  return (
    <div 
      className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:ring-2 hover:ring-blue-500"
      onClick={onToggle}
    >
      {/* Collapsed View */}
      <div className="flex items-center p-4">
        <div className="w-16 h-16 flex-shrink-0 relative mr-4">
          <Image src={character.imageUrl} alt={character.name} layout="fill" objectFit="cover" className="rounded-md" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{character.name}</h3>
          <p className="text-sm text-gray-400">{character.isUnlocked ? 'Unlocked' : 'Locked'}</p>
        </div>
      </div>

      {/* Expanded View - Using proper height transitions that respect document flow */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <h4 className="font-semibold text-blue-300 mb-2">Skills:</h4>
          <div className="space-y-2">
            {character.skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-3 text-sm">
                {/* Skill Icon */}
                <div className="w-8 h-8 flex-shrink-0">
                  {skill.icon_url ? (
                    <Image
                      src={skill.icon_url}
                      alt={skill.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-gray-700 rounded flex items-center justify-center text-xs text-white font-bold">${skill.name[0]}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center text-xs text-white font-bold">
                      {skill.name[0]}
                    </div>
                  )}
                </div>
                {/* Skill Info */}
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-white">{skill.name}</p>
                  <p className="text-gray-400 text-xs truncate">{skill.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
