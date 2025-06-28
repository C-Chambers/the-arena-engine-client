// src/app/types.ts
// A central place for our shared type definitions

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: Record<string, number>;
}

export interface Character {
  id: string;
  instanceId: string;
  name: string;
  currentHp: number;
  maxHp: number;
  skills: Skill[];
  isAlive: boolean;
  imageUrl: string;
  isUnlocked?: boolean;
}
