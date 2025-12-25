import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Moon } from 'lucide-react';
import AIChatBot from './AIChatBot';
import { isAuthenticated, getCurrentUser } from '../services/authService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check authentication status on mount and when location changes
    setIsLoggedIn(isAuthenticated());
    
    // Listen for storage changes (e.g., when token is set/removed in another tab or component)
    const handleStorageChange = () => {
      setIsLoggedIn(isAuthenticated());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom auth events
    window.addEventListener('authChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Schools', path: '/schools' },
    { 
      name: isLoggedIn ? 'Admin' : 'Admin Login', 
      path: isLoggedIn ? '/admin/profile' : '/admin-login' 
    }, 
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-emerald-900 text-white p-1.5 rounded-lg">
                  <Moon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">Liberia Islamic</h1>
                  <p className="text-[10px] text-emerald-700 font-bold tracking-widest uppercase">Schools Directory</p>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-emerald-900 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/schools">
                 <button className="p-2 text-slate-500 hover:text-emerald-900">
                    <Search className="h-5 w-5" />
                 </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? 'text-emerald-900 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white text-emerald-900 p-1 rounded">
                  <Moon className="h-5 w-5" />
                </div>
                <span className="text-white font-bold text-lg">Islamic Schools Directory</span>
              </div>
              <p className="text-sm text-emerald-300">
                Connecting communities through education and faith. The central hub for all Islamic academic institutions across Liberia.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/schools" className="hover:text-white">Schools List</Link></li>
                <li>
                  <Link 
                    to={isLoggedIn ? '/admin/profile' : '/admin-login'} 
                    className="hover:text-white"
                  >
                    {isLoggedIn ? 'Admin Profile' : 'School Login'}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>National Muslim Council Education Board</li>
                <li>Monrovia, Liberia</li>
                <li>info@islamicschools.lr</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-900 mt-8 pt-8 text-center text-xs text-emerald-400">
            &copy; {new Date().getFullYear()} Liberia Islamic Schools Directory. All rights reserved.
          </div>
        </div>
      </footer>

      {/* AI Assistant */}
      <AIChatBot />
    </div>
  );
};

export default Layout;