// src/app/types.ts

// --- NEW: More specific types for different skill effects ---
interface BaseEffect {
  type: string;
  target: 'self' | 'ally' | 'enemy' | 'all_enemies';
}

export interface DamageEffect extends BaseEffect {
  type: 'damage';
  value: number;
  ignores_shield?: boolean;
  bonus_if_marked?: number; // For skills like Chidori
}

export interface HealEffect extends BaseEffect {
  type: 'heal';
  value: number;
}

export interface ApplyStatusEffect extends BaseEffect {
  type: 'apply_status';
  status: string;
  duration: number;
  // Optional properties for specific statuses
  value?: number;
  chance?: number;
  damage?: number;
  skillId?: number;
  damageBonus?: number;
  reduction_type?: 'flat' | 'percentage';
  classes?: string[];
}

// A union type that can be any of our defined effects
export type SkillEffect = DamageEffect | HealEffect | ApplyStatusEffect;


export interface StatusEffect {
  status: string;
  duration: number;
  casterInstanceId?: string;
  sourceSkill: {
    id: number;
    iconUrl: string;
  };
  [key: string]: any; 
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  cost: Record<string, number>;
  effects: SkillEffect[]; // Use the new union type
  cooldown: number;
  icon_url: string; 
  is_locked_by_default?: boolean;
  skill_class?: string;
}

export interface Character {
  id: number;
  instanceId: string;
  name: string;
  currentHp: number;
  maxHp: number;
  skills: Skill[];
  isAlive: boolean;
  isUnlocked?: boolean;
  imageUrl: string;
  statuses: StatusEffect[];
}
