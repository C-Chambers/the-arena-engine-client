'use client';

import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
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
}

const GameContext = createContext<GameContextState | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [postGameStats, setPostGameStats] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const socket = useRef<WebSocket | null>(null);
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
  };

  const connectAndFindMatch = () => {
    if (socket.current) return;

    const token = localStorage.getItem('arena-token');
    if (!token) {
      setStatusMessage('Authentication error. Please log in again.');
      return;
    }

    setStatusMessage('Connecting to server...');
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);
    socket.current = ws;

    ws.onopen = () => setStatusMessage('Connected! Waiting for an opponent...');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'STATUS') {
        setStatusMessage(data.message);
      } else if (data.type === 'GAME_START') {
        localStorage.setItem('myId', data.yourId);
        setGameState(data.state);
        router.push('/battle');
      } else if (data.type === 'GAME_UPDATE') {
        setGameState(data.state);
        if (data.state.isGameOver) {
          handleGameEnd(data.state);
        }
      } else if (data.type === 'OPPONENT_DISCONNECTED') {
        alert("Opponent has disconnected. Returning to dashboard.");
        router.push('/dashboard');
      } else if (data.type === 'ACTION_ERROR') {
          setErrorMsg(data.message);
          setTimeout(() => setErrorMsg(''), 4000);
      } else if (data.type === 'ERROR') {
        setStatusMessage(`Error: ${data.message}`);
        ws.close();
      }
    };
    
    ws.onclose = () => {
      setStatusMessage('Disconnected.');
      socket.current = null;
    };
    ws.onerror = () => setStatusMessage('Connection Error.');
  };

  const contextValue = { 
      gameState, setGameState, connectAndFindMatch, 
      socket, statusMessage, postGameStats,
      errorMsg, setErrorMsg
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
