'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Character {
  id: string;
  name: string;
  maxHp: number;
  imageUrl: string;
}

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the new character form
  const [newChar, setNewChar] = useState({ id: '', name: '', maxHp: 100, imageUrl: '' });

  const fetchCharacters = async () => {
    const token = localStorage.getItem('arena-token');
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/getCharacters`, {
        headers: { 'x-auth-token': token }
      });
      setCharacters(response.data);
    } catch (err) {
      setError('Failed to fetch characters.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewChar(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('arena-token');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/characters`, {
        character_id: newChar.id,
        name: newChar.name,
        max_hp: newChar.maxHp,
        image_url: newChar.imageUrl,
      }, {
        headers: { 'x-auth-token': token }
      });
      // Reset form and refetch characters
      setNewChar({ id: '', name: '', maxHp: 100, imageUrl: '' });
      fetchCharacters();
    } catch (err) {
      alert('Failed to create character.');
    }
  };
  
  const handleDeleteCharacter = async (charId: string) => {
    if (window.confirm('Are you sure you want to delete this character and all associated skills? This cannot be undone.')) {
        const token = localStorage.getItem('arena-token');
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/characters/${charId}`, {
                headers: { 'x-auth-token': token }
            });
            fetchCharacters(); // Refresh the list
        } catch (err) {
            alert('Failed to delete character.');
        }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Character Management</h1>
      
      {/* Create Character Form */}
      <div className="bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Character</h2>
        <form onSubmit={handleCreateCharacter} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input name="id" value={newChar.id} onChange={handleInputChange} placeholder="Character ID (e.g., char_sbt_05)" className="bg-gray-700 p-2 rounded col-span-2" required />
          <input name="name" value={newChar.name} onChange={handleInputChange} placeholder="Full Name (e.g., Riku, the Storm)" className="bg-gray-700 p-2 rounded col-span-2" required />
          <input name="maxHp" value={newChar.maxHp} onChange={handleInputChange} type="number" placeholder="Max HP" className="bg-gray-700 p-2 rounded" required />
          <input name="imageUrl" value={newChar.imageUrl} onChange={handleInputChange} placeholder="Image URL (e.g., /images/riku.png)" className="bg-gray-700 p-2 rounded col-span-4" required />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white font-bold">Create</button>
        </form>
      </div>

      {/* Characters Table */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Existing Characters</h2>
        <table className="w-full text-left">
          <thead className="border-b border-gray-700 text-gray-400">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Max HP</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {characters.map(char => (
              <tr key={char.id} className="border-b border-gray-800">
                <td className="p-2 font-mono text-sm">{char.id}</td>
                <td className="p-2">{char.name}</td>
                <td className="p-2">{char.maxHp}</td>
                <td className="p-2">
                  <button className="text-yellow-500 hover:text-yellow-400 mr-4">Edit</button>
                  <button onClick={() => handleDeleteCharacter(char.id)} className="text-red-500 hover:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <p className="text-center mt-4">Loading...</p>}
        {error && <p className="text-center mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
}
