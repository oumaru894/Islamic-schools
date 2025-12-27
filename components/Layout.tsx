import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Moon } from 'lucide-react';
import AIChatBot from './AIChatBot';
import { isAuthenticated, getCurrentUser } from '../services/authService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Scroll detection for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Skip to main content - Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-900 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className={`bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Link to="/" className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 group">
                <div className="bg-emerald-900 text-white p-1 sm:p-1.5 rounded-lg group-hover:bg-emerald-800 transition-colors">
                  <Moon className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 hidden xs:block">
                  <h1 className="text-sm xs:text-base sm:text-xl font-bold text-slate-900 leading-tight truncate">Liberia Islamic</h1>
                  <p className="text-[7px] xs:text-[8px] sm:text-[10px] text-emerald-700 font-bold tracking-wider sm:tracking-widest uppercase whitespace-nowrap">Schools Directory</p>
                </div>
                {/* Abbreviated version for very small screens */}
                <div className="min-w-0 xs:hidden">
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">LIS</h1>
                  <p className="text-[7px] text-emerald-700 font-bold tracking-wide uppercase">Directory</p>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-2.5 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(link.path)
                      ? 'text-emerald-900 bg-emerald-50 shadow-sm'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/schools">
                 <button className="p-2 text-slate-500 hover:text-emerald-900 hover:bg-emerald-50 rounded-md transition-all duration-200" aria-label="Search schools">
                    <Search className="h-4 w-4 lg:h-5 lg:w-5" />
                 </button>
              </Link>
            </div>

            {/* Tablet Nav (between mobile and desktop) */}
            <div className="hidden sm:flex md:hidden items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive(link.path)
                      ? 'text-emerald-900 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  {link.name === 'Admin Login' ? 'Login' : link.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors active:scale-95"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <>
            <style>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .mobile-menu-animate {
                animation: slideDown 0.2s ease-out;
              }
            `}</style>
            <div className="sm:hidden bg-white border-t border-slate-100 shadow-lg mobile-menu-animate">
              <div className="px-3 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                    isActive(link.path)
                      ? 'text-emerald-900 bg-emerald-50 shadow-sm'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive(link.path) && (
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  )}
                </Link>
              ))}
              <Link 
                to="/schools" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 transition-all duration-200 active:scale-95"
              >
                <Search className="h-4 w-4" />
                <span>Search Schools</span>
              </Link>
            </div>
          </div>
          </>
        )}
      </nav>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 sm:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1 w-full" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-100">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* About Section */}
            <div className="xs:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="bg-white text-emerald-900 p-1 rounded shadow-sm">
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-white font-bold text-sm xs:text-base sm:text-lg leading-tight">Islamic Schools Directory</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-300 leading-relaxed max-w-md">
                Connecting communities through education and faith. The central hub for all Islamic academic institutions across Liberia.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition-colors inline-flex items-center gap-1 hover:translate-x-1 transform duration-200">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/schools" className="hover:text-white transition-colors inline-flex items-center gap-1 hover:translate-x-1 transform duration-200">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                    Schools List
                  </Link>
                </li>
                <li>
                  <Link 
                    to={isLoggedIn ? '/admin/profile' : '/admin-login'} 
                    className="hover:text-white transition-colors inline-flex items-center gap-1 hover:translate-x-1 transform duration-200"
                  >
                    <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                    {isLoggedIn ? 'Admin Profile' : 'School Login'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h3>
              <ul className="space-y-2 text-xs sm:text-sm leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">📍</span>
                  <span>National Muslim Council Education Board</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">🏙️</span>
                  <span>Monrovia, Liberia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✉️</span>
                  <span className="break-all">info@islamicschools.lr</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="border-t border-emerald-900 mt-6 sm:mt-8 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-xs text-emerald-400 text-center sm:text-left">
                &copy; {new Date().getFullYear()} Liberia Islamic Schools Directory. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-emerald-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Assistant */}
      <AIChatBot />
    </div>
  );
};

export default Layout;