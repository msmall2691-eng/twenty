'use client';

import { Bell, Search, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/intake': 'Intake Requests',
  '/clients': 'Clients',
  '/quotes': 'Quotes & Invoices',
  '/schedule': 'Schedule',
  '/automations': 'Automations',
  '/templates': 'Templates',
  '/integrations': 'Integrations',
};

export function Header() {
  const pathname = usePathname();
  const title = Object.entries(pageTitles).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path),
  )?.[1] ?? 'Admin';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">The Maine Cleaning Company</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search clients, quotes..."
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium">Admin</span>
        </button>
      </div>
    </header>
  );
}
