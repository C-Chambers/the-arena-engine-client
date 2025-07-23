'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface PlayerRating {
  rating: number;
  rd: number;
  vol: number;
  games_played: number;
  wins: number;
  losses: number;
}

// A simple utility to convert MMR to a Rank Name
const getRankName = (rating: number) => {
  if (rating < 1400) return 'Academy Student';
  if (rating < 1600) return 'Genin';
  if (rating < 1800) return 'Chunin';
  if (rating < 2000) return 'Jonin';
  return 'Kage';
};

export default function PlayerRankDisplay() {
  const [ratingInfo, setRatingInfo] = useState<PlayerRating | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRating = async () => {
      const token = localStorage.getItem('arena-token');
      if (!token) return;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/ratings`, {
          headers: { 'x-auth-token': token },
        });
        setRatingInfo(response.data);
      } catch (err) {
        setError('Could not load player rating.');
        console.error(err);
      }
    };
    fetchRating();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!ratingInfo) return <div className="animate-pulse">Loading rank...</div>;
  
  const rankName = getRankName(ratingInfo.rating);
  const winRate = ratingInfo.games_played > 0 
    ? ((ratingInfo.wins / ratingInfo.games_played) * 100).toFixed(1) 
    : 0;

  return (
    <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-300 mb-4">Your Rank</h2>
      <div className="text-center">
        <p className="text-4xl font-bold text-blue-400">{rankName}</p>
        <p className="text-lg text-gray-400 font-mono">{Math.round(ratingInfo.rating)} MMR</p>
      </div>
      <div className="mt-6 flex justify-around text-center">
        <div>
          <p className="text-gray-500 text-sm">Wins</p>
          <p className="text-2xl font-bold">{ratingInfo.wins}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Losses</p>
          <p className="text-2xl font-bold">{ratingInfo.losses}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Win Rate</p>
          <p className="text-2xl font-bold">{winRate}%</p>
        </div>
      </div>
    </div>
  );
}
