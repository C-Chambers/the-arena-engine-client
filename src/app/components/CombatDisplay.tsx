'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import { Character, Skill } from '../types';
import CharacterCard from './CharacterCard';
import SkillButton from './SkillButton';
import SkillStack from './SkillStack'; // Import the new SkillStack component
import { useGame } from '../context/GameContext';

export default function CombatDisplay() {
  const { gameState, socket } = useGame();
  
  const [myId, setMyId] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCaster, setSelectedCaster] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const storedId = localStorage.getItem('myId');
    if (storedId) {
      setMyId(storedId);
    }
  }, []);

  useEffect(() => {
    // When a new turn starts, clear selections and any old error messages
    setSelectedSkill(null);
    setSelectedCaster(null);
    setErrorMsg('');
  }, [gameState?.turn]);

  // Handler for when a message is received from the server
  useEffect(() => {
    if (socket.current) {
        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { type, payload } = data; // Assuming a payload structure
            
            // The GameContext will handle the main state updates (GAME_START, GAME_UPDATE)
            // This component only needs to handle local UI feedback like errors.
            if (type === 'ACTION_ERROR') {
                setErrorMsg(payload.message);
                // Clear the error message after a few seconds
                setTimeout(() => setErrorMsg(''), 3000);
            }
        };
    }
  }, [socket]);


  // --- NEW: Updated action handlers for the Skill Stack system ---

  const handleQueueSkill = (targetId: string) => {
    if (socket.current && selectedSkill && selectedCaster) {
      socket.current.send(JSON.stringify({ 
        type: 'QUEUE_SKILL', 
        payload: { skill: selectedSkill, casterId: selectedCaster, targetId: targetId } 
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
              onClick={selectedSkill && isMyTurn ? () => handleQueueSkill(char.instanceId) : undefined}
            />
          </div>
        ))}
      </div>

      {/* Turn Indicator & Error Message */}
      <div className="text-center bg-gray-900 py-2 rounded-lg">
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
                onClick={selectedSkill && isMyTurn ? () => handleQueueSkill(char.instanceId) : undefined}
            />
          </div>
          <div className="flex-1 flex gap-2">
            {char.skills.map((skill: Skill) => (
              <SkillButton 
                key={skill.id}
                skill={skill}
                canAfford={true} // Chakra validation is now handled server-side for the whole queue
                cooldown={myPlayer.cooldowns[skill.id] || 0}
                onClick={() => {
                  setSelectedSkill(skill);
                  setSelectedCaster(char.instanceId);
                }}
              />
            ))}
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
        <div className="w-1/2 bg-gray-900 p-3 rounded-lg font-mono text-xs overflow-y-auto h-24">
            <h4 className="font-bold">Game Log:</h4>
            {gameState.log.slice().reverse().map((line: string, i: number) => <p key={i}>{line}</p>)}
        </div>
        <div className="flex-1 flex items-center justify-center">
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
