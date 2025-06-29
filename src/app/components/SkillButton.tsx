'use client';

import { Skill } from '../types';

interface SkillButtonProps {
  skill: Skill;
  canAfford: boolean;
  cooldown: number;
  isQueued: boolean; // This prop tells the button if its character has already acted
  onClick: () => void;
}

export default function SkillButton({ skill, canAfford, cooldown, isQueued, onClick }: SkillButtonProps) {
  const isOnCooldown = cooldown > 0;

  return (
    <button
      onClick={onClick}
      // A skill is now disabled if its character has already queued a skill, it's on cooldown, or the player can't afford it.
      disabled={!canAfford || isOnCooldown || isQueued}
      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm text-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:enabled:bg-blue-700 transition-colors relative"
      title={skill.description}
    >
      {/* If the skill is on cooldown, show a timer overlay */}
      {isOnCooldown && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-md">
          <span className="text-white font-bold text-2xl">{cooldown}</span>
        </div>
      )}
      {/* If the character has already queued a skill, show a different overlay */}
      {isQueued && !isOnCooldown && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-md">
           <span className="text-white font-bold text-xs">QUEUED</span>
        </div>
      )}
      <p className="font-semibold">{skill.name}</p>
      <p className="text-xs font-mono">{Object.entries(skill.cost).map(([type, val]) => `${type[0]}:${val}`).join(' ')}</p>
    </button>
  );
}
