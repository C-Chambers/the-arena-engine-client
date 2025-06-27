'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Mission {
  mission_id: number;
  title: string;
  description: string;
  type: string;
  goal: number;
  reward_text: string;
  current_progress: number; // New field from our API
  is_completed: boolean;     // New field from our API
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMissions = async () => {
      const token = localStorage.getItem('arena-token');
      if (!token) {
        setError('Authentication error. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3001/api/missions', {
          headers: {
            'x-auth-token': token,
          },
        });
        setMissions(response.data);
      } catch (err) {
        setError('Failed to load missions.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissions();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p className="text-white text-xl animate-pulse">Loading Missions...</p></div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-full"><p className="text-red-500 text-xl">{error}</p></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 bg-gray-900 rounded-t-lg border-b border-gray-700">
        <h1 className="text-2xl font-bold">Missions</h1>
        <p className="text-sm text-gray-400">Complete objectives to earn rewards.</p>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {missions.map((mission) => {
            const progressPercentage = Math.min((mission.current_progress / mission.goal) * 100, 100);

            return (
              <div 
                key={mission.mission_id} 
                className={`bg-gray-900 p-6 rounded-lg flex items-center justify-between transition-opacity ${mission.is_completed ? 'opacity-50' : ''}`}
              >
                <div className="flex-grow">
                  <h2 className="text-xl font-bold text-blue-400">{mission.title}</h2>
                  <p className="text-gray-300 mt-1">{mission.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-grow bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-yellow-400 h-4 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-mono text-gray-400 whitespace-nowrap">
                      {mission.current_progress} / {mission.goal}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-8 flex-shrink-0 w-48">
                  <p className="font-semibold text-gray-400">REWARD</p>
                  <p className="text-lg font-bold text-yellow-400">{mission.reward_text}</p>
                  {mission.is_completed && <p className="text-sm font-bold text-green-500 mt-1">COMPLETED</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
