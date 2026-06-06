"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, CheckSquare, Database } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { name: 'Pipeline', href: '/kanban', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Daily Tasks', href: '/tasks', icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="w-64 bg-zinc-950 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">
          Z
        </div>
        <h1 className="text-xl font-bold tracking-tight">ZIRITH CRM</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white font-medium shadow-sm' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {session?.user?.email === 'binforpc@gmail.com' && (
          <Link
            href="/lead-bank"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors mt-8 ${
              pathname === '/lead-bank'
                ? 'bg-emerald-600 text-white font-medium shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
            }`}
          >
            <Database className="h-5 w-5 text-emerald-400" />
            Lead Bank
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-zinc-400">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-zinc-200 truncate">{session?.user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
