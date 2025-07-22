'use client'; 

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setSelectedSkill(null);
    setSelectedCaster(null);
    setErrorMsg('');
  }, [gameState?.turn, setErrorMsg]);

  const handleQueueSkill = (targetId: string) => {
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
    if(socket.current) {
        socket.current.send(JSON.stringify({ type: 'EXECUTE_TURN' }));
    }
  };
  
  if (!gameState || !myId) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-white text-xl animate-pulse">Loading Game...</p>
        </div>
    );
  }

  const myPlayer = gameState.players[myId];
  const opponentPlayer = gameState.players[Object.keys(gameState.players).find((id: any) => id !== myId)!];
  const isMyTurn = Number(gameState.activePlayerId) === Number(myId);
  
  // --- UPDATED: canAffordSkill now uses the two-pass algorithm and considers cost reduction ---
  const canAffordSkill = (skill: Skill, casterInstanceId?: string) => {
    if (!myPlayer || !myPlayer.chakra) return false;
    
    // NEW: Apply cost reduction if the caster has it
    let effectiveSkillCost = skill.cost;
    if (casterInstanceId) {
      const caster = myPlayer.team.find((char: Character) => char.instanceId === casterInstanceId);
      if (caster) {
        const costReductionStatus = caster.statuses.find((s: any) => s.status === 'cost_reduction');
        if (costReductionStatus) {
          const reducedCost: Record<string, number> = {};
          for (const [type, value] of Object.entries(skill.cost)) {
            let newValue = value;
            if (costReductionStatus.reduction_type === 'flat') {
              newValue = Math.max(0, value - (costReductionStatus.value || 0));
            } else if (costReductionStatus.reduction_type === 'percentage') {
              newValue = Math.max(0, Math.floor(value * (1 - (costReductionStatus.value || 0) / 100)));
            }
            reducedCost[type] = newValue;
          }
          effectiveSkillCost = reducedCost;
        }
      }
    }
    
    // First, calculate the total cost of the queue plus the new skill
    const currentQueueCost = myPlayer.actionQueue.reduce((acc: any, action: any) => {
        for (const type in action.skill.cost) {
            acc[type] = (acc[type] || 0) + action.skill.cost[type];
        }
        return acc;
    }, {});
    
    const totalCost = { ...currentQueueCost };
    for (const type in effectiveSkillCost) {
        totalCost[type] = (totalCost[type] || 0) + effectiveSkillCost[type];
        }

    // Now, run the two-pass validation
    const tempChakra = { ...myPlayer.chakra };
    
    // 1. First Pass: Deduct specific costs
    for (const type in totalCost) {
        if (type !== 'Random') {
            if (!tempChakra[type] || tempChakra[type] < totalCost[type]) {
                return false;
    }
            tempChakra[type] -= totalCost[type];
        }
    }
    
    // 2. Second Pass: Check if remaining chakra can cover the random cost
    const randomCost = totalCost['Random'] || 0;
    if (randomCost > 0) {
        const remainingChakraCount = Object.values(tempChakra).reduce((sum: number, count: any) => sum + count, 0);
        if (remainingChakraCount < randomCost) {
            return false;
        }
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

      <div className="text-center bg-gray-900 py-2 rounded-lg min-h-[56px]">
        <p className="font-bold text-xl">Turn {gameState.turn}: <span className={isMyTurn ? 'text-green-400' : 'text-red-400'}>{isMyTurn ? "Your Turn" : "Opponent's Turn"}</span></p>
        {selectedSkill && <p className="text-sm text-purple-400 animate-pulse">Select a target for {selectedSkill.name}</p>}
        {errorMsg && <p className="text-sm text-red-500 font-bold">{errorMsg}</p>}
      </div>

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
              
              // --- UPDATED: Find the stun status to get its specific classes ---
              const stunStatus = char.statuses.find((status: any) => status.status === 'stun');
              const stunnedClasses = stunStatus ? stunStatus.classes : null;

              const isEmpowered = char.statuses.some((s: any) => s.status === 'empower_skill' && s.skillId === skill.id);
              const isEnabled = char.statuses.some((s: any) => s.status === 'enable_skill' && s.skillId === skill.id);
              
              // NEW: Check for cost reduction status
              const costReductionStatus = char.statuses.find((s: any) => s.status === 'cost_reduction');
              const costReduction = costReductionStatus ? {
                value: costReductionStatus.value || 0,
                reduction_type: costReductionStatus.reduction_type || 'flat'
              } : null;
              
              if (skill.is_locked_by_default && !isEnabled) {
                return null;
              }

              return (
                <SkillButton 
                  key={skill.id}
                  skill={skill}
                  canAfford={canAffordSkill(skill, char.instanceId)}
                  cooldown={cooldown}
                  isQueued={hasQueued}
                  stunnedClasses={stunnedClasses} // UPDATED: Pass the array of stunned classes
                  isEmpowered={isEmpowered}
                  costReduction={costReduction} // NEW: Pass cost reduction status
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