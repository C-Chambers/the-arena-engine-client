'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useGame } from '../context/GameContext'; // Import the useGame hook

// Define the navigation items
const navItems = [
  // The "Play" and "Main Menu" items are now handled separately below
  { name: 'Team Builder', href: '/team-builder', icon: '👥' },
  { name: 'Roster', href: '/roster', icon: '📖' },
  { name: 'Missions', href: '/missions', icon: '🎯' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { connectAndFindMatch, statusMessage } = useGame(); // Get matchmaking functions from context

  const handleLogout = () => {
    // Clear the user's token and redirect to the login page
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
          {/* Special "Play" button that triggers matchmaking */}
          <li className="mb-4">
            <button
              onClick={connectAndFindMatch}
              className={`flex items-center p-3 rounded-lg w-full text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white`}
            >
              <span className="mr-3 text-lg">▶️</span>
              <span>Play</span>
            </button>
          </li>
          
          {/* New "Main Menu" button */}
          <li className="mb-4">
             <a
                href="/dashboard"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname === '/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">🏠</span>
                <span>Main Menu</span>
              </a>
          </li>


          {navItems.map((item) => (
            <li key={item.name} className="mb-4">
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
      
      {/* Matchmaking status message is now here */}
      <div className="text-center p-2 mb-2 h-12">
        <p className="text-gray-400 text-sm animate-pulse">{statusMessage}</p>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-800 hover:text-white transition-colors"
        >
          <span className="mr-3 text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
