'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import { Character, Skill } from '../types';
import CharacterCard from './CharacterCard';
import SkillButton from './SkillButton';
import { useGame } from '../context/GameContext';
import SkillStack from './SkillStack'; 

export default function CombatDisplay() {
  const { gameState, socket, errorMsg, setErrorMsg } = useGame();
  
  const [myId, setMyId] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCaster, setSelectedCaster] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('myId');
    if (storedId) {
      setMyId(storedId);
    }
  }, []);

  // --- THIS IS THE CRITICAL FIX ---
  // This effect runs every time the game's turn number changes.
  // It resets the local state, ensuring the component is ready for the new turn.
  useEffect(() => {
    const turn = gameState ? gameState.turn : 'N/A';
    // DEBUG LOG 1: Check if the turn change is detected
    console.log(`%cTURN ${turn}: State updated. Resetting local skill selection.`, 'color: yellow; font-weight: bold;');
    setSelectedSkill(null);
    setSelectedCaster(null);
    setErrorMsg('');
  }, [gameState?.turn, setErrorMsg]);


  // Action handlers for the Skill Stack system
  const handleQueueSkill = (targetId: string) => {
    const skillName = selectedSkill ? selectedSkill.name : 'Unknown Skill';
    console.log(`%cHANDLE QUEUE SKILL: Sending skill ${skillName} on target ${targetId}`, 'color: cyan');
    if (socket.current && selectedSkill && selectedCaster) {
      const casterChar = gameState.players[myId!].team.find((c: Character) => c.instanceId === selectedCaster);
      socket.current.send(JSON.stringify({ 
        type: 'QUEUE_SKILL', 
        payload: { skill: selectedSkill, casterId: selectedCaster, targetId: targetId, caster: casterChar } 
      }));
      setSelectedSkill(null);
      setSelectedCaster(null);
    }
  };

  const handleDequeueSkill = (index: number) => {
      if(socket.current) {
          socket.current.send(JSON.stringify({ type: 'DEQUEUE_SKILL', payload: { queueIndex: index } }));
      }
  };

  const handleReorderQueue = (oldIndex: number, newIndex: number) => {
      if(socket.current) {
          socket.current.send(JSON.stringify({ type: 'REORDER_QUEUE', payload: { oldIndex, newIndex } }));
      }
  };

  const handleExecuteTurn = () => {
    console.log("%cEXECUTE TURN CLICKED", 'color: orange; font-weight: bold;');
    if(socket.current) {
        socket.current.send(JSON.stringify({ type: 'EXECUTE_TURN' }));
    }
  };
  
  if (!gameState || !myId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-gray-700 p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Game Status</h2>
            <p className="text-xl text-white animate-pulse">Waiting for game to start...</p>
        </div>
      </div>
    );
  }

  const myPlayer = gameState.players[myId];
  const opponentPlayer = gameState.players[Object.keys(gameState.players).find(id => id !== myId)!];
  const isMyTurn = Number(gameState.activePlayerId) === Number(myId);
  
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
                  if (selectedSkill && isMyTurn && char.isAlive) {
                      handleQueueSkill(char.instanceId);
                  }
              }}
            />
          </div>
        ))}
      </div>

      {/* Turn Indicator */}
      <div className="text-center bg-gray-900 py-2 rounded-lg min-h-[56px]">
        <p className="font-bold text-xl">Turn {gameState.turn}: <span className={isMyTurn ? 'text-green-400' : 'text-red-400'}>{isMyTurn ? "Your Turn" : "Opponent's Turn"}</span></p>
        {selectedSkill && <p className="text-sm text-purple-400 animate-pulse">Select a target for {selectedSkill.name}</p>}
        {errorMsg && <p className="text-sm text-red-500 font-bold">{errorMsg}</p>}
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
                  if (selectedSkill && isMyTurn && char.isAlive) {
                    handleQueueSkill(char.instanceId);
                  }
                }}
            />
          </div>
          <div className="flex-1 flex gap-2">
            {char.skills.map((skill: Skill) => {
              const cooldown = myPlayer.cooldowns[skill.id] || 0;
              const hasQueued = myPlayer.actionQueue.some((a: any) => a.casterId === char.instanceId);
              return (
                <SkillButton 
                  key={skill.id}
                  skill={skill}
                  canAfford={true} // Chakra cost is validated on the server for the whole queue
                  cooldown={cooldown}
                  isQueued={hasQueued}
                  onClick={() => {
                    setSelectedSkill(skill);
                    setSelectedCaster(char.instanceId);
                  }}
                />
              )
            })}
          </div>
        </div>
      ))}
      
      {/* Bottom Bar: Skill Stack and Execute Button */}
      <div className="flex gap-4 mt-auto">
        <div className="w-2/3">
            <SkillStack queue={myPlayer.actionQueue} onReorder={handleReorderQueue} onRemove={handleDequeueSkill} />
        </div>
        <div className="w-1/3 flex flex-col gap-2">
            <div className="flex-1 bg-gray-900 p-3 rounded-lg">
                <h4 className="font-bold text-lg mb-1">Your Chakra</h4>
                <p className="font-mono text-purple-300">{JSON.stringify(myPlayer.chakra)}</p>
            </div>
            <button 
                onClick={handleExecuteTurn} 
                disabled={!isMyTurn}
                className="w-full h-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-2xl"
            >
                Execute Turn
            </button>
        </div>
      </div>
    </div>
  );
}
