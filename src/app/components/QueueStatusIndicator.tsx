'use client';

import { useGame } from '../context/GameContext';

export default function QueueStatusIndicator() {
  const { isInQueue, queueInfo, statusMessage, isConnected, leaveQueue } = useGame();

  if (!isConnected && !isInQueue) {
    return null; // Don't show anything if not connected and not in queue
  }

  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-lg border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">
            {isInQueue ? '🎮 In Queue' : '🔗 Connected'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {isInQueue && queueInfo?.timeInQueue !== undefined 
              ? `${queueInfo.timeInQueue}s wait` 
              : statusMessage}
          </div>
        </div>
        
        {isInQueue && queueInfo?.queuePosition && (
          <div className="text-right">
            <div className="text-xs text-yellow-400">Position</div>
            <div className="text-sm font-bold text-white">
              {queueInfo.queuePosition}/{queueInfo.totalInQueue}
            </div>
          </div>
        )}
      </div>
      
      {isInQueue && queueInfo?.priority && (
        <div className="mt-2 text-xs text-orange-400">
          ⭐ Priority Queue
        </div>
      )}
      
      {/* Leave Queue Button - only show when in queue */}
      {isInQueue && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <button
            onClick={leaveQueue}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors"
          >
            Leave Queue
          </button>
        </div>
      )}
    </div>
  );
} 