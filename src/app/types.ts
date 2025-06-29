// src/app/types.ts
// A central place for our shared type definitions

export interface Skill {
  id: number;
  name: string;
  description: string;
  cost: Record<string, number>;
  effects: object[];
  cooldown: number; // NEW: Add the cooldown property
}

export interface Character {
  id: number;
  instanceId: string;
  name: string;
  currentHp: number;
  maxHp: number;
  skills: Skill[];
  isAlive: boolean;
  imageUrl: string;
  isUnlocked?: boolean;
}
