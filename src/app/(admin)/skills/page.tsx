'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// ... (Interface definitions remain the same)
interface Skill {
  skill_id: number;
  character_id: number;
  character_name: string;
  name: string;
  description: string;
  cost: object;
  effects: object[];
  cooldown: number;
  skill_class: string;
  skill_range: string;
  skill_persistence: string;
}
interface CharacterForSelect {
  id: string;
  name: string;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [characters, setCharacters] = useState<CharacterForSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UPDATED: Added new fields to the form state
  const [newSkill, setNewSkill] = useState({
    character_id: '',
    name: '',
    description: '',
    cost: '{}',
    effects: '[]',
    cooldown: 0,
    skill_class: '',
    skill_range: '',
    skill_persistence: '',
  });

  const fetchData = async () => {
    // ... (fetchData logic remains the same)
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
      
      fetchData(); 
      setNewSkill({ 
          character_id: characters[0]?.id || '', 
          name: '', description: '', cost: '{}', effects: '[]',
          cooldown: 0, skill_class: '', skill_range: '', skill_persistence: '' 
      });

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
            <select name="character_id" value={newSkill.character_id} onChange={handleInputChange} className="bg-gray-700 p-2 rounded" required>
                <option value="" disabled>Select Owner Character</option>
                {/* --- UPDATED: Now uses char.id which exists on the object --- */}
                {characters.map(char => (
                    <option key={char.id} value={char.id}>{char.name}</option>
                ))}
            </select>
            <input name="name" value={newSkill.name} onChange={handleInputChange} placeholder="Skill Name" className="bg-gray-700 p-2 rounded" required />
            <input name="cooldown" type="number" value={newSkill.cooldown} onChange={handleInputChange} placeholder="Cooldown" className="bg-gray-700 p-2 rounded" required />
          </div>
          {/* --- NEW: Inputs for skill classifications --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="skill_class" value={newSkill.skill_class} onChange={handleInputChange} placeholder="Class (e.g. physical)" className="bg-gray-700 p-2 rounded" />
            <input name="skill_range" value={newSkill.skill_range} onChange={handleInputChange} placeholder="Range (e.g. melee)" className="bg-gray-700 p-2 rounded" />
            <input name="skill_persistence" value={newSkill.skill_persistence} onChange={handleInputChange} placeholder="Persistence (e.g. instant)" className="bg-gray-700 p-2 rounded" />
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
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Class</th>
              <th className="p-2">Range</th>
              <th className="p-2">Persistence</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => (
              <tr key={skill.skill_id} className="border-b border-gray-800">
                <td className="p-2 font-mono">{skill.skill_id}</td>
                <td className="p-2 font-semibold text-blue-300">{skill.name}</td>
                <td className="p-2">{skill.character_name}</td>
                <td className="p-2 text-gray-400">{skill.skill_class}</td>
                <td className="p-2 text-gray-400">{skill.skill_range}</td>
                <td className="p-2 text-gray-400">{skill.skill_persistence}</td>
                <td className="p-2">
                  <button className="text-red-500 hover:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
