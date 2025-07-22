'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Character } from '../../types';
import RosterCard from '../../components/RosterCard';

export default function RosterPage() {
  const [fullRoster, setFullRoster] = useState<Character[]>([]);
  const [filteredRoster, setFilteredRoster] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoster = async () => {
      const token = localStorage.getItem('arena-token');
      if (!token) {
        setError('Authentication error. Please log in.');
        setIsLoading(false);
        return;
      }
      
      try {
        // This uses the new, public /api/roster endpoint
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/roster`, { headers: { 'x-auth-token': token } });
        setFullRoster(response.data);
        setFilteredRoster(response.data);
      } catch (err) {
        setError('Failed to load character roster.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoster();
  }, []);

  useEffect(() => {
    // Filter the roster based on the search term
    const results = fullRoster.filter(character =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoster(results);
  }, [searchTerm, fullRoster]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p className="text-white text-xl animate-pulse">Loading Full Roster...</p></div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-full"><p className="text-red-500 text-xl">{error}</p></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 bg-gray-900 rounded-t-lg border-b border-gray-700">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Character Roster</h1>
            <input 
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoster.map(character => (
            <RosterCard key={character.id} character={character} />
          ))}
        </div>
      </div>
    </div>
  );
}
