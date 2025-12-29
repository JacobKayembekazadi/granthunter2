'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Search, ShieldAlert, Cpu, LayoutDashboard,
  Radar, Factory as FactoryIcon, FolderOpen, Settings as SettingsIcon,
  ChevronRight, ChevronLeft, Bell, Server, Sparkles, LogOut, X
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { id: 'overview', path: '/', icon: LayoutDashboard, label: 'OVERVIEW' },
  { id: 'hunter', path: '/hunter', icon: Radar, label: 'SEARCH AGENTS' },
  { id: 'factory', path: '/factory', icon: FactoryIcon, label: 'PROPOSAL CENTER' },
  { id: 'artifacts', path: '/artifacts', icon: FolderOpen, label: 'FILES' },
  { id: 'settings', path: '/settings', icon: SettingsIcon, label: 'SETTINGS' },
];

// Mock notifications - in production, fetch from API
const mockNotifications = [
  { id: 1, title: 'New opportunity matched', message: 'DARPA cybersecurity RFP matches your profile', time: '5m ago', unread: true },
  { id: 2, title: 'Proposal deadline approaching', message: 'DoD Cloud Services due in 3 days', time: '1h ago', unread: true },
  { id: 3, title: 'Agent scan complete', message: 'Found 12 new opportunities', time: '2h ago', unread: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [time, setTime] = useState<Date | null>(null);
  const [commandText, setCommandText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [logs, setLogs] = useState<string[]>([
    'System ready.',
    'Secure connection established.',
    'AI analysis engine online.',
    'All search agents active.',
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only set time on client to avoid hydration mismatch
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const logPool = [
      'Scanning SAM.gov for new leads...',
      'Optimizing proposal draft...',
      'New opportunity identified in DARPA sector.',
      'Data backup completed.',
      'Checking compliance requirements...',
    ];
    const timer = setInterval(() => {
      setLogs(prev => [...prev, logPool[Math.floor(Math.random() * logPool.length)]].slice(-6));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;

    setLogs(prev => [...prev, `Action: ${commandText}`, 'Processing request...']);
    setCommandText('');

    toast.info("Assistant: " + commandText, {
      description: "Interpreting request and routing to appropriate section.",
      icon: <Sparkles className="w-4 h-4 text-blue-400" />
    });
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050A14] text-slate-100 font-sans relative">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Collapsible Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-[#0B1221]/95 border-r border-slate-800 flex flex-col z-20 tech-border transition-all duration-300`}>
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <ShieldAlert className="w-8 h-8 text-blue-500 shrink-0" />
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white glow-blue">
                    GRANTHUNTER
                  </h1>
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                    Contracting Platform
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded-lg hover:bg-slate-800 transition-colors ${isCollapsed ? 'absolute right-2 top-4' : ''}`}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
          {!isCollapsed && (
            <div className="flex items-center space-x-2 mt-4 px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded text-[10px] text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span>SYSTEM: ONLINE</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-2 space-y-1">
          {!isCollapsed && (
            <div className="px-2 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Navigation</div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} group
                  ${active
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-500 hover:text-slate-200 border border-transparent hover:bg-slate-800/50'}
                `}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-600'}`} />
                  {!isCollapsed && <span className="tracking-wide">{item.label}</span>}
                </div>
                {!isCollapsed && active && <ChevronRight className="w-3 h-3 text-blue-500" />}
              </button>
            );
          })}
        </nav>

        {/* Activity Log - hidden when collapsed */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-black/20 border-t border-slate-800 font-mono text-[10px] text-slate-500 h-32 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2 text-slate-600 border-b border-slate-800 pb-1">
              <span>ACTIVITY LOG</span>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto scrollbar-hide">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start">
                  <span className="mr-2 opacity-50">{'>'}</span>
                  <span>{log}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {/* Status & Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-[#070C18]">
          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <MetricBox label="PROCESSING" value="Normal" color="text-emerald-400" icon={Cpu} />
              <MetricBox label="CONNECTION" value="Secure" color="text-blue-400" icon={Server} />
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>SIGN OUT</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <header className="h-16 bg-[#0B1221]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-20">
          <form onSubmit={handleCommand} className="flex-1 max-w-2xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="Find opportunities, draft proposals, or ask a question..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </form>

          <div className="flex items-center space-x-6 pl-6">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-[#0B1221] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <span className="text-sm font-bold text-slate-200">Notifications</span>
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-blue-400 hover:text-blue-300"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${notification.unread ? 'bg-blue-500/5' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {notification.unread && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                                <span className="text-xs font-bold text-slate-200">{notification.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">{notification.message}</p>
                              <span className="text-[10px] text-slate-600 mt-2 block">{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-800 text-center">
                    <button className="text-xs text-blue-400 hover:text-blue-300">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-200">
                {time ? time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">
                {time ? time.toLocaleDateString([], { month: 'short', day: '2-digit' }) : '---'}
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">OP</div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden relative">
          <div className="h-full w-full overflow-auto scrollbar-hide">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

const MetricBox: React.FC<{ label: string; value: string; color: string; icon: any }> = ({ label, value, color, icon: Icon }) => (
  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/40 flex items-center space-x-2">
    <Icon className={`w-3 h-3 ${color}`} />
    <div>
      <div className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">{label}</div>
      <div className={`text-xs font-bold ${color}`}>{value}</div>
    </div>
  </div>
);
