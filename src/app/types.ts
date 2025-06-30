// src/app/types.ts

// NEW: A specific type for status effects
export interface StatusEffect {
  type: string;
  duration: number;
  sourceSkill: {
    id: number;
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
  icon_url: string; // Add the icon_url property
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
