'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/adminDashboard', icon: '📊' },
  { name: 'Characters', href: '/characters', icon: '👥' },
  { name: 'Skills', href: '/skills', icon: '🔥' },
  { name: 'Missions', href: '/missions', icon: '🎯' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 border-r border-gray-700">
      <div className="text-2xl font-bold mb-10 text-center text-red-500">
        Admin Panel
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                href={`${item.href}`}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname.startsWith(`${item.href}`) ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <Link href="/dashboard" className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-blue-800 hover:text-white transition-colors">
            <span className="mr-3 text-lg">➡️</span>
            <span>Exit Admin</span>
        </Link>
      </div>
    </aside>
  );
}
