'use client';

import { Skill } from '../types';

interface SkillButtonProps {
  skill: Skill;
  canAfford: boolean;
  cooldown: number; // NEW: The number of turns remaining on the cooldown
  onClick: () => void;
}

export default function SkillButton({ skill, canAfford, cooldown, onClick }: SkillButtonProps) {
  const isOnCooldown = cooldown > 0;

  return (
    <button
      onClick={onClick}
      // A skill is disabled if it's on cooldown OR the player can't afford it
      disabled={!canAfford || isOnCooldown}
      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm text-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:enabled:bg-blue-700 transition-colors relative"
      title={skill.description}
    >
      {/* If the skill is on cooldown, show a timer overlay */}
      {isOnCooldown && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-md">
          <span className="text-white font-bold text-2xl">{cooldown}</span>
        </div>
      )}
      <p className="font-semibold">{skill.name}</p>
      <p className="text-xs font-mono">{Object.entries(skill.cost).map(([type, val]) => `${type[0]}:${val}`).join(' ')}</p>
    </button>
  );
}
