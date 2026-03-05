import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  if (!user) {
    // This should be handled by a ProtectedRoute component, but simple check here
    // navigate('/login'); // Don't redirect here to avoid loops during render, handle in App.tsx
  }

  const navItems = [
    { icon: Home, label: '홈', path: '/dashboard' },
    { icon: PlusCircle, label: '추모 생성', path: '/create' },
    { icon: User, label: '내 정보', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-base flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/20">
        <h1 className="font-serif text-lg font-medium text-text">Everlasting Memory</h1>
        <button onClick={() => signOut()} className="p-2 text-text/60 hover:text-accent">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 p-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {location.pathname !== '/create' && (
        <nav className="h-16 bg-white border-t border-primary/20 fixed bottom-0 w-full max-w-md flex items-center justify-around px-2 z-50">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-accent" : "text-text/40 hover:text-text/60"
                )}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
