'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGame } from '../context/GameContext';
import { jwtDecode } from 'jwt-decode'; // Import the JWT decoding library

// Define a type for our JWT payload to access the user's admin status
interface JwtPayload {
  user: {
    is_admin: boolean;
  };
}

const navItems = [
  { name: 'Main Menu', href: '/dashboard', icon: '🏠' },
  { name: 'Team Builder', href: '/team-builder', icon: '👥' },
  { name: 'Roster', href: '/roster', icon: '📖' },
  { name: 'Missions', href: '/missions', icon: '🎯' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { connectAndFindMatch, statusMessage } = useGame();
  const [isAdmin, setIsAdmin] = useState(false); // State to track admin status

  useEffect(() => {
    // Check the user's token for admin status when the component mounts
    const token = localStorage.getItem('arena-token');
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        if (decodedToken.user && decodedToken.user.is_admin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Invalid token found:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('arena-token');
    router.push('/');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 border-r border-gray-700">
      <div className="text-2xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
        The Arena Engine
      </div>
      <nav className="flex-grow">
        <ul>
          <li className="mb-4">
            <button
              onClick={connectAndFindMatch}
              className={`flex items-center p-3 rounded-lg w-full text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white`}
            >
              <span className="mr-3 text-lg">▶️</span>
              <span>Play</span>
            </button>
          </li>
          
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <a
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname.startsWith(item.href) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="text-center p-2 mb-2 h-12">
        <p className="text-gray-400 text-sm animate-pulse">{statusMessage}</p>
      </div>

      <div>
        {/* --- NEW: Conditionally render the Admin Dashboard link --- */}
        {isAdmin && (
           <a
            href="/admin/adminDashboard" // Assuming this is the main admin page route
            className="w-full flex items-center p-3 mb-2 rounded-lg text-gray-300 bg-red-800 bg-opacity-50 hover:bg-red-700 hover:text-white transition-colors"
          >
            <span className="mr-3 text-lg">⚙️</span>
            <span>Admin Dashboard</span>
          </a>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <span className="mr-3 text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
