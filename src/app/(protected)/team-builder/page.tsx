'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Character } from '../../types';
import Image from 'next/image';

// Add isUnlocked to our Character type for the frontend
interface RosterCharacter extends Character {
  isUnlocked: boolean;
}

export default function TeamBuilderPage() {
  const [roster, setRoster] = useState<RosterCharacter[]>([]);
  const [activeTeam, setActiveTeam] = useState<(Character | null)[]>([null, null, null]);
  const [selectedCharacter, setSelectedCharacter] = useState<RosterCharacter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchRoster = async () => {
      const token = localStorage.getItem('arena-token');
      if (!token) {
        setError('Authentication error. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/characters`, {
          headers: { 'x-auth-token': token },
        });
        
        setRoster(response.data);
        // Set the default selected character to the first *unlocked* one
        const firstUnlocked = response.data.find((char: RosterCharacter) => char.isUnlocked);
        if (firstUnlocked) {
          setSelectedCharacter(firstUnlocked);
        }

      } catch (err) {
        setError('Failed to load character roster.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoster();
  }, []);

  const handleSelectCharacter = (character: RosterCharacter) => {
    // Only allow selecting unlocked characters
    if (character.isUnlocked) {
      setSelectedCharacter(character);
    }
  };

  const handleAddSelectedToTeam = () => {
    if (!selectedCharacter || !selectedCharacter.isUnlocked) return;
    if (activeTeam.some(member => member?.id === selectedCharacter.id)) {
        setSaveStatus('This character is already on your team.');
        return;
    }
    const firstEmptySlot = activeTeam.findIndex(slot => slot === null);
    if (firstEmptySlot !== -1) {
      const newTeam = [...activeTeam];
      newTeam[firstEmptySlot] = selectedCharacter;
      setActiveTeam(newTeam);
    } else {
        setSaveStatus('Your team is full.');
    }
  };

  const handleRemoveFromTeam = (index: number) => {
    const newTeam = [...activeTeam];
    newTeam[index] = null;
    setActiveTeam(newTeam);
  };

  const handleSaveTeam = async () => {
    setSaveStatus('Saving...');
    if (activeTeam.some(member => member === null)) {
      setSaveStatus('Your team must have 3 characters to save.');
      return;
    }

    const teamCharacterIds = activeTeam.map(member => member!.id);
    const token = localStorage.getItem('arena-token');

    if (!token) {
      setSaveStatus('Authentication error. Please log in again.');
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team`, 
        { teamCharacterIds },
        { headers: { 'x-auth-token': token } }
      );
      setSaveStatus('Team saved successfully!');
    } catch (err) {
      setSaveStatus('Failed to save team.');
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p className="text-white text-xl animate-pulse">Loading Roster...</p></div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-full"><p className="text-red-500 text-xl">{error}</p></div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 p-4 rounded-lg">
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-900 rounded-t-lg border-b border-gray-700">
        <h1 className="text-2xl font-bold">Team Builder</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-400 h-4">{saveStatus}</p>
          <button 
            onClick={handleSaveTeam}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Save Team
          </button>
        </div>
      </div>

      <div className="flex flex-grow gap-8 p-4">
        <div className="w-1/2 flex flex-col gap-8">
          <div className="h-1/2 bg-gray-900 p-6 rounded-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">Full Roster</h2>
            <div className="overflow-y-auto pr-2 flex-grow">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {roster.map(char => (
                  <div 
                    key={char.id} 
                    className={`p-2 rounded-lg text-center border-2 transition-all min-w-0 relative ${
                      !char.isUnlocked
                        ? 'border-transparent bg-gray-700 opacity-50 cursor-not-allowed'
                        : selectedCharacter?.id === char.id 
                          ? 'border-yellow-400 bg-gray-600' 
                          : 'border-transparent bg-gray-700 cursor-pointer hover:bg-gray-600'
                    }`}
                    onClick={() => handleSelectCharacter(char)}
                    title={char.name}
                  >
                    {!char.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                        <span className="text-white text-4xl font-bold">🔒</span>
                      </div>
                    )}
                    {char.imageUrl ? (
                      <Image src={char.imageUrl} alt={char.name} width={80} height={80} className="w-full h-20 object-cover rounded mb-2" />
                    ) : (
                      <div className="w-full h-20 bg-gray-800 mb-2 rounded flex items-center justify-center text-xs text-gray-400">[P]</div>
                    )}
                    <p className="font-semibold text-sm truncate">{char.name.split(',')[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-1/2 bg-gray-900 p-6 rounded-lg flex gap-4">
            <div className="w-1/3 flex flex-col items-center">
                <h3 className="text-lg font-bold mb-2">Details</h3>
                {selectedCharacter && selectedCharacter.imageUrl ? (
                  <Image src={selectedCharacter.imageUrl} alt={selectedCharacter.name} width={128} height={128} className={`w-32 h-32 object-cover rounded ${!selectedCharacter.isUnlocked && 'grayscale'}`} />
                ) : (
                  <div className="w-32 h-32 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">[Portrait]</div>
                )}
            </div>
            <div className="w-2/3">
              {selectedCharacter ? (
                <>
                  <h3 className="text-2xl font-bold text-blue-400">{selectedCharacter.name}</h3>
                  <p className="text-gray-300 mt-2 text-sm">A brief bio or description of the character's playstyle will go here, providing insight into their strengths and synergies.</p>
                  {selectedCharacter.isUnlocked ? (
                    <button onClick={handleAddSelectedToTeam} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Add to Team</button>
                  ) : (
                    <p className="mt-4 text-red-500 font-semibold">This character is locked.</p>
                  )}
                </>
              ) : (
                <p className="text-gray-400">Select a character.</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col gap-8">
          <div className="flex-1 bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Active Team</h2>
            <div className="grid grid-cols-3 gap-6 h-full">
              {activeTeam.map((char, index) => (
                <div key={index} className="h-full bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center relative p-2 cursor-pointer hover:border-red-500" onClick={() => handleRemoveFromTeam(index)}>
                  {char && char.imageUrl ? (
                    <>
                      <Image src={char.imageUrl} alt={char.name} width={96} height={96} className="w-24 h-24 object-cover rounded mb-2" />
                      <p className="font-bold text-center text-sm">{char.name}</p>
                      <div className="absolute top-1 right-1 text-red-500 font-bold text-xl">×</div>
                    </>
                  ) : (
                    <span className="text-gray-500 text-4xl">+</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-gray-900 p-6 rounded-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">Skills of {selectedCharacter ? selectedCharacter.name.split(',')[0] : '...'}</h2>
            <div className="overflow-y-auto space-y-2 pr-2 flex-grow">
              {selectedCharacter ? selectedCharacter.skills.map(skill => (
                  <div key={skill.id} className="bg-gray-800 p-2 rounded">
                    <p className="font-semibold text-blue-300">{skill.name}</p>
                    <p className="text-xs text-gray-400">{skill.description}</p>
                  </div>
              )) : (
                <p className="text-gray-400">Select a character to see their skills.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
