'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skill } from '../types';

interface SkillImageGridProps {
  skills: Skill[];
  characterName: string;
}

export default function SkillImageGrid({ skills, characterName }: SkillImageGridProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Reset selected skill when character changes
  useEffect(() => {
    setSelectedSkill(null);
  }, [characterName, skills]);

  if (!skills || skills.length === 0) {
    return (
      <div className="h-1/2 bg-gray-900 p-6 rounded-lg flex flex-col">
        <h2 className="text-xl font-bold mb-4">Skills of {characterName || '...'}</h2>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-400">Select a character to see their skills.</p>
        </div>
      </div>
    );
  }

  const formatCost = (cost: Record<string, number>) => {
    return Object.entries(cost).map(([type, value]) => `${type}: ${value}`).join(', ');
  };

  return (
    <div className="h-1/2 bg-gray-900 p-6 rounded-lg flex flex-col">
      <h2 className="text-xl font-bold mb-4">Skills of {characterName || '...'}</h2>
      
      {/* Skills Grid */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`w-16 h-16 cursor-pointer rounded-lg border-2 transition-all hover:scale-105 ${
              selectedSkill?.id === skill.id
                ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                : 'border-gray-600 hover:border-blue-400'
            }`}
            onClick={() => setSelectedSkill(skill)}
            title={skill.name}
          >
            {skill.icon_url ? (
              <Image
                src={skill.icon_url}
                alt={skill.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-xs text-white font-bold text-center p-1">${skill.name}</div>`;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-xs text-white font-bold text-center p-1">
                {skill.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Skill Details */}
      <div className="flex-grow bg-gray-800 p-4 rounded-lg overflow-y-auto">
        {selectedSkill ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0">
                {selectedSkill.icon_url ? (
                  <Image
                    src={selectedSkill.icon_url}
                    alt={selectedSkill.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-xs text-white font-bold">${selectedSkill.name[0]}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-xs text-white font-bold">
                    {selectedSkill.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-blue-300">{selectedSkill.name}</h3>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Energy: {formatCost(selectedSkill.cost)}</span>
                  <span>Cooldown: {selectedSkill.cooldown}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-300">{selectedSkill.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-700 p-2 rounded">
                  <span className="text-gray-400">Class:</span>
                  <span className="ml-2 text-white">{selectedSkill.skill_class}</span>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <span className="text-gray-400">Range:</span>
                  <span className="ml-2 text-white">{selectedSkill.skill_range}</span>
                </div>
                {selectedSkill.skill_persistence && (
                  <div className="bg-gray-700 p-2 rounded col-span-2">
                    <span className="text-gray-400">Persistence:</span>
                    <span className="ml-2 text-white">{selectedSkill.skill_persistence}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Click on a skill icon to see its details</p>
          </div>
        )}
      </div>
    </div>
  );
}