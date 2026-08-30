'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FileText, 
  PlusCircle, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Layers,
  Menu,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getDemoUser, setDemoUser } from '@/lib/storage';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          return;
        }
      }
      
      const demoUser = getDemoUser();
      if (demoUser) {
        setUserEmail(demoUser.email);
      } else {
        setUserEmail('demo@triples.software');
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setDemoUser(null);
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'New Quotation', href: '/quotations/new', icon: PlusCircle },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Triple S
                </span>
                <span className="block text-[10px] text-blue-400 font-medium -mt-1 tracking-wider uppercase">
                  Quotation Manager
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/quotations/new');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right User & Actions Area */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <Link
              href="/quotations/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-500 active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Create Quote
            </Link>

            <div className="h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-300 max-w-[160px] truncate font-medium">
                  {userEmail || 'Guest'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 truncate">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium py-1 px-2.5 rounded bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
