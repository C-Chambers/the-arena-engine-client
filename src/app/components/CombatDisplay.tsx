'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import { Character, Skill } from '../types';
import CharacterCard from './CharacterCard';
import SkillButton from './SkillButton';
import { useGame } from '../context/GameContext';

export default function CombatDisplay() {
  const { gameState, socket } = useGame();
  
  const [myId, setMyId] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCaster, setSelectedCaster] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('myId');
    setMyId(storedId);
  }, []);

  useEffect(() => {
    // DEBUG LOG 1: Check if the turn change is detected
    console.log('TURN', gameState?.turn:, ' State updated. Resetting skill selection.');
    setSelectedSkill(null);
    setSelectedCaster(null);
  }, [gameState?.turn]);


  const handleUseSkill = (targetId: string) => {
    // DEBUG LOG 4: Check if the final skill use handler is called
    console.log('HANDLE USE SKILL: Sending skill', selectedSkill?.name, ' on target ', targetId);
    if (socket.current && selectedSkill && selectedCaster) {
      socket.current.send(JSON.stringify({ 
        type: 'USE_SKILL', 
        payload: { skill: selectedSkill, casterId: selectedCaster, targetId: targetId } 
      }));
    }
  };

  const handleEndTurn = () => {
    console.log("HANDLE END TURN: Sending END_TURN action.");
    if(socket.current) {
        socket.current.send(JSON.stringify({ type: 'END_TURN' }));
    }
  };
  
  if (!gameState || !myId) {
    return <div className="text-white text-center">Loading Game...</div>;
  }

  const myPlayer = gameState.players[myId];
  const opponentPlayer = gameState.players[Object.keys(gameState.players).find(id => id !== myId)!];
  const isMyTurn = Number(gameState.activePlayerId) === Number(myId);
  
  // DEBUG LOG 2: Check the component's state on every render
  console.log('RENDER CHECK: Turn=', gameState.turn, ', IsMyTurn=', isMyTurn, ', SelectedSkill=', selectedSkill?.name || 'null');

  const canAffordSkill = (skill: Skill) => {
    if (!myPlayer || !myPlayer.chakra) return false;
    for (const type in skill.cost) {
      if (!myPlayer.chakra[type] || myPlayer.chakra[type] < skill.cost[type]) return false;
    }
    return true;
  };

  if (gameState.isGameOver) {
    return (
        <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-2xl">{gameState.log[gameState.log.length - 1]}</p>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Opponent's Team */}
      <div className="flex gap-4">
        {opponentPlayer.team.map((char: Character) => (
          <div key={char.instanceId} className="flex-1">
            <CharacterCard 
              character={char} 
              isPlayer={false} 
              onClick={() => {
                  // DEBUG LOG 3: Check if clicking the opponent does anything
                  console.log('TARGET CLICKED: Opponent', char.name, '. Conditions: selectedSkill=', !!selectedSkill, ', isMyTurn=', isMyTurn, ', isAlive=', char.isAlive);
                  if (selectedSkill && isMyTurn && char.isAlive) {
                      handleUseSkill(char.instanceId);
                  }
              }}
            />
          </div>
        ))}
      </div>

      {/* Turn Indicator */}
      <div className="text-center bg-gray-900 py-2 rounded-lg">
        <p className="font-bold text-xl">Turn {gameState.turn}: <span className={isMyTurn ? 'text-green-400' : 'text-red-400'}>{isMyTurn ? "Your Turn" : "Opponent's Turn"}</span></p>
        {selectedSkill && <p className="text-sm text-purple-400 animate-pulse">Select a target for {selectedSkill.name}</p>}
      </div>

      {/* Player's Team & Skills */}
      {myPlayer.team.map((char: Character) => (
        <div key={char.instanceId} className="flex items-center gap-4">
          <div className="w-1/3">
            <CharacterCard 
                character={char} 
                isPlayer={true} 
                isSelected={selectedCaster === char.instanceId}
                onClick={() => {
                  console.log(`TARGET CLICKED: Ally ${char.name}. Conditions: selectedSkill=${!!selectedSkill}, isMyTurn=${isMyTurn}, isAlive=${char.isAlive}`);
                  if (selectedSkill && isMyTurn && char.isAlive) {
                    handleUseSkill(char.instanceId);
                  }
                }}
            />
          </div>
          <div className="flex-1 flex gap-2">
            {char.skills.map((skill: Skill) => (
              <SkillButton 
                key={skill.id}
                skill={skill}
                canAfford={canAffordSkill(skill) && isMyTurn && char.isAlive}
                onClick={() => {
                  console.log(`SKILL BUTTON CLICKED: Set selectedSkill to ${skill.name}`);
                  setSelectedSkill(skill);
                  setSelectedCaster(char.instanceId);
                }}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Resources and Log */}
      <div className="flex gap-4 mt-auto">
        <div className="w-1/3 bg-gray-900 p-3 rounded-lg">
            <h4 className="font-bold text-lg mb-1">Your Chakra</h4>
            <p className="font-mono text-purple-300">{JSON.stringify(myPlayer.chakra)}</p>
        </div>
        <div className="w-1/2 bg-gray-900 p-3 rounded-lg font-mono text-xs overflow-y-auto h-24">
            <h4 className="font-bold">Game Log:</h4>
            {gameState.log.slice().reverse().map((line: string, i: number) => <p key={i}>{line}</p>)}
        </div>
        <div className="flex-1 flex items-center justify-center">
            <button 
                onClick={handleEndTurn} 
                disabled={!isMyTurn}
                className="w-full h-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                End Turn
            </button>
        </div>
      </div>
    </div>
  );
}
