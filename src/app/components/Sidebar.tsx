'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useGame } from '../context/GameContext';
import { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

interface JwtPayload {
  user: {
    is_admin?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
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
  const { connectAndFindMatch, cancelQueue, isQueueing, statusMessage } = useGame();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
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
              onClick={isQueueing ? cancelQueue : connectAndFindMatch}
              className={`flex items-center p-3 rounded-lg w-full text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white`}
            >
              <span className="mr-3 text-lg">{isQueueing ? '⏹️' : '▶️'}</span>
              <span>{isQueueing ? 'Cancel Queue' : 'Play'}</span>
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

      {/* Only render the admin dashboard link if the user is admin */}
      {isAdmin && (
        <a
          href="/adminDashboard"
          className="w-full flex items-center p-3 mb-2 rounded-lg text-gray-300 bg-red-800 bg-opacity-50 hover:bg-red-700 hover:text-white transition-colors"
        >
          <span className="mr-3 text-lg">⚙️</span>
          <span>Admin Dashboard</span>
        </a>
      )}

      <button
        onClick={handleLogout}
        className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
      >
        Logout
      </button>
    </aside>
  );
}