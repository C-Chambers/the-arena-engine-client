'use client';

import { Skill } from '../types';

interface SkillButtonProps {
  skill: Skill;
  canAfford: boolean;
  cooldown: number;
  isQueued: boolean;
  isStunned: boolean;
  onClick: () => void;
}

export default function SkillButton({ skill, canAfford, cooldown, isQueued, onClick }: SkillButtonProps) {
  const isOnCooldown = cooldown > 0;

  return (
    <button
      onClick={onClick}
      disabled={!canAfford || isOnCooldown || isQueued || isStunned}
      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm text-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:enabled:bg-blue-700 transition-colors relative"
      title={skill.description}
    >
      {isOnCooldown && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-md">
          <span className="text-white font-bold text-2xl">{cooldown}</span>
        </div>
      )}
      {isQueued && !isOnCooldown && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-md">
           <span className="text-white font-bold text-xs">QUEUED</span>
        </div>
      )}
      {!isQueued && !isOnCooldown && !canAfford && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-md">
           <span className="text-white font-bold text-xs">BROKE BOI</span>
        </div>
      )}
      {/* --- NEW: Visual overlay for the stun status --- */}
      {isStunned && (
        <div className="absolute inset-0 bg-yellow-500 bg-opacity-80 flex items-center justify-center rounded-md">
           <span className="text-black font-bold text-xs">STUNNED</span>
        </div>
      )}
      <p className="font-semibold">{skill.name}</p>
      
      {/* --- UPDATED: Chakra cost display logic --- */}
      <div className="flex justify-center items-center gap-1 text-xs font-mono mt-1">
        {Object.entries(skill.cost).map(([type, val]) => {
          if (type === 'Random') {
            return <span key={type} className="text-gray-300">{`?:${val}`}</span>;
          }
          return <span key={type}>{`${type[0]}:${val}`}</span>;
        })}
      </div>
    </button>
  );
}
