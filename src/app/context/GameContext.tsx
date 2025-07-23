'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface GameContextState {
  gameState: any;
  setGameState: (state: any) => void;
  connectAndFindMatch: () => void;
  socket: React.RefObject<WebSocket | null>;
  statusMessage: string;
  postGameStats: any;
  errorMsg: string;
  setErrorMsg: (msg: string) => void;
  isConnected: boolean;
  isInQueue: boolean;
  queueInfo: any;
  leaveQueue: () => void;
}

const GameContext = createContext<GameContextState | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [postGameStats, setPostGameStats] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueInfo, setQueueInfo] = useState<any>(null);
  const socket = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);
  const router = useRouter();

  const handleGameEnd = async (finalGameState: any) => {
    const token = localStorage.getItem('arena-token');
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/ratings`, {
        headers: { 'x-auth-token': token },
      });
      setPostGameStats({ finalState: finalGameState, newRating: response.data });
      router.push('/post-game');
    } catch (error) {
      console.error("Failed to fetch post-game ratings.", error);
      setPostGameStats({ finalState: finalGameState, newRating: null });
      router.push('/post-game');
    }
    setGameState(null);
    setIsInQueue(false); // Clear queue status when game ends
  };

  // Function to establish persistent WebSocket connection
  const establishConnection = () => {
    const token = localStorage.getItem('arena-token');
    if (!token) {
      setStatusMessage('Authentication error. Please log in again.');
      return;
    }

    if (socket.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    console.log('Establishing WebSocket connection...');
    setStatusMessage('Connecting to server...');
    
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);
    socket.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setStatusMessage('Connected! Ready to find matches.');
      reconnectAttempts.current = 0;
      reconnectDelay.current = 1000;
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'STATUS') {
        setStatusMessage(data.message);
        setIsInQueue(true);
        setQueueInfo(data); // Store additional queue information
        
        // Log enhanced queue info if available
        if (data.queuePosition) {
          console.log(`Queue status: Position ${data.queuePosition}/${data.totalInQueue}, Wait time: ${data.timeInQueue}s`);
        }
      } else if (data.type === 'GAME_START') {
        localStorage.setItem('myId', data.yourId);
        setGameState(data.state);
        setIsInQueue(false); // No longer in queue
        router.push('/battle');
      } else if (data.type === 'GAME_UPDATE') {
        setGameState(data.state);
        if (data.state.isGameOver) {
          handleGameEnd(data.state);
        }
      } else if (data.type === 'OPPONENT_DISCONNECTED') {
        alert("Opponent has disconnected. Returning to dashboard.");
        setIsInQueue(false);
        router.push('/dashboard');
      } else if (data.type === 'ACTION_ERROR') {
        setErrorMsg(data.message);
        setTimeout(() => setErrorMsg(''), 4000);
      } else if (data.type === 'MATCHMAKING_ERROR') {
        setStatusMessage(`Matchmaking Error: ${data.message}`);
        setIsInQueue(false);
      } else if (data.type === 'ERROR') {
        setStatusMessage(`Error: ${data.message}`);
        setIsInQueue(false);
        ws.close();
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      setIsInQueue(false);
      socket.current = null;
      
      // Attempt to reconnect if we have attempts left
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
        setStatusMessage(`Connection lost. Reconnecting... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          establishConnection();
        }, reconnectDelay.current);
        
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000); // Exponential backoff
      } else {
        setStatusMessage('Connection lost. Please refresh the page.');
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatusMessage('Connection error occurred.');
    };
  };

  // Auto-establish connection when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('arena-token');
    if (token && !socket.current) {
      establishConnection();
    }

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  const leaveQueue = () => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.close();
      setIsInQueue(false);
      setStatusMessage('Left the queue.');
    }
  };

  const connectAndFindMatch = () => {
    // If already connected, just join queue
    if (socket.current?.readyState === WebSocket.OPEN) {
      setStatusMessage('Joining queue...');
      setIsInQueue(true);
      return;
    }

    // If not connected, establish connection first
    establishConnection();
  };

  const contextValue = { 
      gameState, setGameState, connectAndFindMatch, 
      socket, statusMessage, postGameStats,
      errorMsg, setErrorMsg, isConnected, isInQueue, 
      queueInfo, leaveQueue
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
