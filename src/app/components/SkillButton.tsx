'use client';

import { Skill } from '../types';

interface SkillButtonProps {
  skill: Skill;
  canAfford: boolean;
  cooldown: number;
  isQueued: boolean;
  stunnedClasses: string[] | null; // UPDATED: Replaces isStunned: boolean
  isEmpowered: boolean;
  onClick: () => void;
}

export default function SkillButton({ skill, canAfford, cooldown, isQueued, stunnedClasses, isEmpowered, onClick }: SkillButtonProps) {
  const isOnCooldown = cooldown > 0;

  // NEW: Check if this specific skill's class is included in the current stun classes
  const isStunnedByClass = stunnedClasses ? stunnedClasses.includes(skill.skill_class) : false;

  const empoweredClasses = isEmpowered ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50' : '';

  return (
    <button
      onClick={onClick}
      // UPDATED: The disabled check now uses the more specific isStunnedByClass
      disabled={!canAfford || isOnCooldown || isQueued || isStunnedByClass}
      className={`flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm text-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:enabled:bg-blue-700 transition-all relative ${empoweredClasses}`}
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
      {/* UPDATED: The visual overlay for stun now uses the specific class check */}
      {isStunnedByClass && (
        <div className="absolute inset-0 bg-yellow-500 bg-opacity-80 flex items-center justify-center rounded-md">
           <span className="text-black font-bold text-xs">STUNNED</span>
        </div>
      )}
      <p className="font-semibold">{skill.name}</p>
      
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