'use client';

import { Skill } from '../types';

interface SkillButtonProps {
  skill: Skill;
  canAfford: boolean;
  onClick: () => void;
}

export default function SkillButton({ skill, canAfford, onClick }: SkillButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm text-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:enabled:bg-blue-700 transition-colors"
      title={skill.description}
    >
      <p className="font-semibold">{skill.name}</p>
      <p className="text-xs font-mono">{Object.entries(skill.cost).map(([type, val]) => `${type[0]}:${val}`).join(' ')}</p>
    </button>
  );
}
