'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter(); // Initialize the router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const endpoint = isLoginMode ? '/login' : '/register';
    const payload = { email, password };

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (isLoginMode) {
        const { token } = response.data;
        localStorage.setItem('arena-token', token);
        setSuccessMessage('Login successful! Redirecting...');
        
        // Redirect to the dashboard page on successful login
        router.push('/dashboard'); 

      } else {
        setSuccessMessage('Registration successful! Please login.');
        setIsLoginMode(true);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'An error occurred.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 bg-opacity-70 p-8 rounded-xl shadow-2xl backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        {isLoginMode ? 'Account Login' : 'Create Account'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-400 text-sm font-bold mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-400 text-sm font-bold mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
        </div>
        {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-xs text-center mb-4">{successMessage}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoginMode ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <div className="text-center mt-6">
        <button
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError('');
            setSuccessMessage('');
          }}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {isLoginMode ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
