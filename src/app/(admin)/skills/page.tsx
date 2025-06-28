'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Skill {
  skill_id: string;
  character_id: string;
  character_name: string;
  name: string;
  description: string;
  cost: object;
  effects: object[];
}

// UPDATED: The type now correctly uses 'id' to match the API response
interface CharacterForSelect {
  id: string;
  name: string;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [characters, setCharacters] = useState<CharacterForSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newSkill, setNewSkill] = useState({
    skill_id: '',
    character_id: '',
    name: '',
    description: '',
    cost: '{}',
    effects: '[]',
  });

  const fetchData = async () => {
    const token = localStorage.getItem('arena-token');
    if (!token) {
      setError('Authentication Error');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const [skillsRes, charsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/skills`, { headers: { 'x-auth-token': token } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/getCharacters`, { headers: { 'x-auth-token': token } })
      ]);
      setSkills(skillsRes.data);
      setCharacters(charsRes.data);
      if (charsRes.data.length > 0) {
        setNewSkill(prev => ({ ...prev, character_id: charsRes.data[0].id }));
      }
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('arena-token');
    if (!newSkill.character_id) {
        alert('Please select a character owner.');
        return;
    }
    try {
      JSON.parse(newSkill.cost);
      JSON.parse(newSkill.effects);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/skills`, newSkill, {
        headers: { 'x-auth-token': token }
      });
      
      // We can just refetch all data to ensure the list is perfectly in sync
      fetchData();

      // Reset form
      setNewSkill({ skill_id: '', character_id: characters[0]?.id || '', name: '', description: '', cost: '{}', effects: '[]' });

    } catch (err) {
      alert('Failed to create skill. Make sure Cost and Effects are valid JSON.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Skill Management</h1>
      
      <div className="bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Skill</h2>
        <form onSubmit={handleCreateSkill} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="skill_id" value={newSkill.skill_id} onChange={handleInputChange} placeholder="Skill ID (e.g., skill_sbt_10)" className="bg-gray-700 p-2 rounded" required />
            
            <select name="character_id" value={newSkill.character_id} onChange={handleInputChange} className="bg-gray-700 p-2 rounded" required>
                <option value="" disabled>Select Owner Character</option>
                {/* --- UPDATED: Now uses char.id which exists on the object --- */}
                {characters.map(char => (
                    <option key={char.id} value={char.id}>{char.name}</option>
                ))}
            </select>
            
            <input name="name" value={newSkill.name} onChange={handleInputChange} placeholder="Skill Name" className="bg-gray-700 p-2 rounded" required />
          </div>
          <textarea name="description" value={newSkill.description} onChange={handleInputChange} placeholder="Skill Description" className="w-full bg-gray-700 p-2 rounded" rows={2} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea name="cost" value={newSkill.cost} onChange={handleInputChange} placeholder='Cost JSON (e.g., {"Power": 1})' className="w-full bg-gray-700 p-2 rounded font-mono" rows={3} required />
            <textarea name="effects" value={newSkill.effects} onChange={handleInputChange} placeholder='Effects JSON Array (e.g., [{"type": "damage", ...}])' className="w-full bg-gray-700 p-2 rounded font-mono" rows={3} required />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white font-bold w-full">Create Skill</button>
        </form>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Existing Skills</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-700 text-gray-400">
            <tr>
              <th className="p-2">Skill ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Description</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => (
              <tr key={skill.skill_id} className="border-b border-gray-800">
                <td className="p-2 font-mono">{skill.skill_id}</td>
                <td className="p-2 font-semibold text-blue-300">{skill.name}</td>
                <td className="p-2">{skill.character_name}</td>
                <td className="p-2 text-gray-400">{skill.description}</td>
                <td className="p-2">
                  <button className="text-red-500 hover:text-red-400">Delete</button>
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
