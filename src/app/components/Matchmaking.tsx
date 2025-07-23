'use client';

import { useGame } from '../context/GameContext';

export default function Matchmaking() {
  const { connectAndFindMatch, statusMessage, isConnected, isInQueue, queueInfo, leaveQueue } = useGame();

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-semibold mb-4 text-white">Find a Match</h2>
      
      {/* Connection Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Status Message */}
      <p className="text-gray-300 mb-4 h-6">{statusMessage}</p>
      
      {/* Enhanced Queue Information */}
      {isInQueue && queueInfo && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Queue Status</div>
          <div className="grid grid-cols-2 gap-4 text-white">
            {queueInfo.queuePosition && (
              <div>
                <div className="text-yellow-400 font-semibold">Position</div>
                <div>{queueInfo.queuePosition} of {queueInfo.totalInQueue}</div>
              </div>
            )}
            {queueInfo.timeInQueue !== undefined && (
              <div>
                <div className="text-blue-400 font-semibold">Wait Time</div>
                <div>{queueInfo.timeInQueue}s</div>
              </div>
            )}
            {queueInfo.queue && (
              <div>
                <div className="text-purple-400 font-semibold">Queue Type</div>
                <div className="capitalize">{queueInfo.queue}</div>
              </div>
            )}
            {queueInfo.priority && (
              <div>
                <div className="text-orange-400 font-semibold">Priority</div>
                <div>⭐ High Priority</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isInQueue ? (
          <button 
            onClick={connectAndFindMatch}
            disabled={!isConnected}
            className={`w-full font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 ${
              isConnected 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isConnected ? 'Find Match' : 'Connecting...'}
          </button>
        ) : (
          <button 
            onClick={leaveQueue}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
          >
            Leave Queue
          </button>
        )}
      </div>

      {/* Persistent Queue Notice */}
      {isInQueue && (
        <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg">
          <p className="text-blue-200 text-sm">
            🔄 You'll stay in queue while navigating between pages
          </p>
        </div>
      )}
    </div>
  );
}
