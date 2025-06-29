'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface GameState {
  gameState: any;
  setGameState: (state: any) => void;
  connectAndFindMatch: () => void;
  cancelQueue: () => void;
  isQueueing: boolean;
  socket: React.RefObject<WebSocket | null>;
  statusMessage: string;
  postGameStats: any; // To hold post-game data
}

const GameContext = createContext<GameState | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Fix: Default to 0 if seconds is falsy or not a valid number
function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [postGameStats, setPostGameStats] = useState<any>(null);
  const socket = useRef<WebSocket | null>(null);
  const router = useRouter();
  const [isQueueing, setIsQueueing] = useState(false);

  const handleGameEnd = async (finalGameState: any) => {
    const token = localStorage.getItem('arena-token');
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/ratings/me`, {
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
  };

  const connectAndFindMatch = () => {
    if (socket.current) return;

    const token = localStorage.getItem('arena-token');
    if (!token) {
      setStatusMessage('Authentication error. Please log in again.');
      return;
    }

    setStatusMessage('Connecting to server...');
    setIsQueueing(true);

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);
    socket.current = ws;

    ws.onopen = () => setStatusMessage('Connected! Waiting for an opponent...');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'STATUS') {
        setStatusMessage(`In ${data.queue} queue... Time in queue: ${formatSeconds(data.timeInQueue)}`);
      } else if (data.type === 'GAME_START') {
        // --- NEW: Store our player ID in localStorage ---
        localStorage.setItem('myId', data.yourId);
        setGameState(data.state);
        setIsQueueing(false);
        router.push('/battle');
      } else if (data.type === 'GAME_UPDATE') {
        setGameState(data.state);
        if (data.state.isGameOver) {
          handleGameEnd(data.state);
        }
      } else if (data.type === 'OPPONENT_DISCONNECTED') {
        alert("Opponent has disconnected. Returning to dashboard.");
        setIsQueueing(false);
        router.push('/dashboard');
      } else if (data.type === 'ERROR') {
        setStatusMessage(`Error: ${data.message}`);
        setIsQueueing(false);
        ws.close();
      }
    };
    ws.onclose = () => {
      setStatusMessage('Disconnected.');
      socket.current = null;
      setIsQueueing(false);
    };
    ws.onerror = () => {
      setStatusMessage('Connection Error.');
      setIsQueueing(false);
    };
  };

  const cancelQueue = () => {
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
    setStatusMessage('');
    setIsQueueing(false);
  };

  return (
    <GameContext.Provider value={{
      gameState,
      setGameState,
      connectAndFindMatch,
      cancelQueue,
      isQueueing,
      socket,
      statusMessage,
      postGameStats
    }}>
      {children}
    </GameContext.Provider>
  );
};