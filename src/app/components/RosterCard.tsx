'use client';

import { Character } from '../types';
import Image from 'next/image';

interface RosterCardProps {
  character: Character;
  isExpanded: boolean; // NEW: Prop to control expansion
  onToggle: () => void;   // NEW: Prop to notify the parent of a click
}

export default function RosterCard({ character, isExpanded, onToggle }: RosterCardProps) {
  // The internal 'isExpanded' state has been removed.

  return (
    <div className="relative"> {/* Added relative positioning container */}
      <div 
        className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:ring-2 hover:ring-blue-500"
        onClick={onToggle} // Use the onToggle handler from props
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
      </div>

      {/* Expanded View - Now positioned absolutely to avoid affecting grid layout */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 rounded-b-lg border border-gray-700 border-t-0 z-10 shadow-xl">
          <div className="p-4">
            <h4 className="font-semibold text-blue-300 mb-2">Skills:</h4>
            <div className="space-y-2">
              {character.skills.map(skill => (
                <div key={skill.id} className="text-sm">
                  <p className="font-bold">{skill.name}</p>
                  <p className="text-gray-400 text-xs">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
