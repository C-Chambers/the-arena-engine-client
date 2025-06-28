'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Character } from '../types';
import Image from 'next/image';

export default function ActiveTeamDisplay() {
  const [team, setTeam] = useState<(Character | null)[]>([null, null, null]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const token = localStorage.getItem('arena-token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team`, {
          headers: { 'x-auth-token': token },
        });

        // The API returns an array of 0 to 3 characters. We need to place them
        // into our 3-slot array structure.
        const fetchedTeam = response.data;
        const newTeamDisplay = [null, null, null];
        fetchedTeam.forEach((char: Character, index: number) => {
            if(index < 3) {
                newTeamDisplay[index] = char;
            }
        });
        setTeam(newTeamDisplay);

      } catch (error) {
        console.error("Failed to fetch active team", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-300 mb-4">Your Active Team</h2>
      <div className="flex justify-center gap-6">
        {team.map((character, index) => (
          <div key={index} className="w-40 h-56 bg-gray-800 border-2 border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 p-2">
            {isLoading ? (
                <p className="animate-pulse">Loading...</p>
            ) : character ? (
              <>
                <Image src={character.imageUrl} alt={character.name} width={128} height={128} className="w-32 h-32 object-cover rounded-md mb-2" />
                <p className="font-semibold text-white text-center text-sm">{character.name}</p>
              </>
            ) : (
              <>
                <div className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-md mb-2 flex items-center justify-center text-3xl">?</div>
                <p className="font-semibold">Empty Slot</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
