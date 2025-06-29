'use client';

import React, { useState } from 'react';
import { Character, Skill } from '../types';
import CharacterCard from './CharacterCard';
import SkillButton from './SkillButton';
import { useGame } from '../context/GameContext';

export default function CombatDisplay() {
  // Use context for all game state, socket, etc.
  const { gameState, socket, statusMessage } = useGame();

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCaster, setSelectedCaster] = useState<string | null>(null);

  // myId is stored in localStorage by GameContext when GAME_START is received
  const myId = typeof window !== 'undefined' ? localStorage.getItem('myId') : null;

  // If not in a game yet, show waiting/status
  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-gray-700 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Game Status</h2>
          <p className="text-xl animate-pulse">{statusMessage}</p>
        </div>
      </div>
    );
  }

  const myPlayer = myId ? gameState.players[myId] : undefined;
  const opponentPlayer = myId
    ? gameState.players[Object.keys(gameState.players).find(id => id !== myId)!]
    : undefined;
  const isMyTurn = myId ? gameState.activePlayerId === myId : false;

  const canAffordSkill = (skill: Skill) => {
    if (!myPlayer || !myPlayer.chakra) return false;
    for (const type in skill.cost) {
      if (!myPlayer.chakra[type] || myPlayer.chakra[type] < skill.cost[type]) return false;
    }
    return true;
  };

  // Use the shared socket from context to send actions
  const handleUseSkill = (targetId: string) => {
    if (socket.current && selectedSkill && selectedCaster) {
      socket.current.send(
        JSON.stringify({
          type: 'USE_SKILL',
          payload: { skill: selectedSkill, casterId: selectedCaster, targetId: targetId },
        })
      );
    }
  };

  if (gameState.isGameOver) {
    return (
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
        <p className="text-2xl">{gameState.log[gameState.log.length - 1]}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Opponent's Team */}
      <div className="flex gap-4">
        {opponentPlayer &&
          opponentPlayer.team.map((char: Character) => (
            <div key={char.instanceId} className="flex-1">
              <CharacterCard character={char} />
            </div>
          ))}
      </div>
      {/* Your Team */}
      <div className="flex gap-4 mt-8">
        {myPlayer &&
          myPlayer.team.map((char: Character) => (
            <div
              key={char.instanceId}
              className={`flex-1 ${selectedCaster === char.instanceId ? 'ring-4 ring-blue-400' : ''}`}
              onClick={() => setSelectedCaster(char.instanceId)}
            >
              <CharacterCard character={char} />
              <div className="flex gap-2 mt-2">
                {char.skills &&
                  char.skills.map((skill: Skill) => (
                    <SkillButton
                      key={skill.skill_id}
                      skill={skill}
                      disabled={!isMyTurn || !canAffordSkill(skill)}
                      selected={selectedSkill?.skill_id === skill.skill_id}
                      onClick={() => setSelectedSkill(skill)}
                    />
                  ))}
              </div>
            </div>
          ))}
      </div>
      {/* Action Panel */}
      <div className="mt-8">
        {selectedSkill && selectedCaster && (
          <div className="text-center">
            <p className="mb-2">
              {isMyTurn
                ? 'Select a target for your skill.'
                : 'Waiting for your turn...'}
            </p>
            {/* Target selection UI could go here */}
          </div>
        )}
        {/* Game log */}
        <div className="bg-gray-800 rounded-lg p-4 mt-4 max-h-48 overflow-y-auto text-gray-200">
          <h3 className="font-bold mb-2">Game Log</h3>
          {gameState.log &&
            gameState.log.map((entry: string, idx: number) => (
              <div key={idx}>{entry}</div>
            ))}
        </div>
      </div>
    </div>
  );
}