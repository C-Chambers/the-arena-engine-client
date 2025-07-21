// src/app/types.ts

export interface StatusEffect {
  type: string;
  status: string;
  duration: number;
  casterInstanceId?: string; // NEW: Add optional caster ID for targeted effects
  sourceSkill: {
    id: number;
    name: string;
    iconUrl: string;
  };
  // Other potential properties like damage, value, etc.
  [key: string]: any; 
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  cost: Record<string, number>;
  effects: object[];
  cooldown: number;
  icon_url: string; 
  is_locked_by_default?: boolean;
  skill_class?: string;
  skill_range?: string;
  skill_persistence?: string;
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
  statuses: StatusEffect[]; // Use our new, more specific type
}
