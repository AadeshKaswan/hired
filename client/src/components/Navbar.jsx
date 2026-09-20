import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ReactComponent as Logo } from "../logo.svg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // If user is on an admin route, don't render the main navbar at all
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Main Floating Island */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl backdrop-saturate-[180%] ${
          scrolled
            ? 'top-4 w-[85%] max-w-[900px] bg-white/70 dark:bg-[#111111]/70 py-2'
            : 'top-6 w-[92%] max-w-[1200px] bg-white/40 dark:bg-[#111111]/40 py-3'
        }`}
      >
        <div className="px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white transition-transform active:scale-95"
            aria-label="Hired Home"
          >
            <Logo className="h-8 w-8" />
            <span>Hired.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!user ? (
              <>
                <NavItem to="/jobs" active={isActive('/jobs')}>Find Jobs</NavItem>
                <NavItem to="/login" active={isActive('/login')}>Login</NavItem>
                <Link
                  to="/register"
                  className="ml-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-full hover:scale-105 active:scale-95 transition-transform duration-200"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <NavItem to="/jobs" active={isActive('/jobs')}>Jobs</NavItem>
                {user.role === 'employer' ? (
                  <>
                    <NavItem to="/post-job" active={isActive('/post-job')}>Post Job</NavItem>
                    <NavItem to="/my-jobs" active={isActive('/my-jobs')}>My Jobs</NavItem>
                  </>
                ) : (
                  <NavItem to="/my-applications" active={isActive('/my-applications')}>Applications</NavItem>
                )}

                {/* Resume Analyzer Link (visible to all authenticated users) */}
                <NavItem to="/resume/upload" active={isActive('/resume/upload')}>
                  Resume Analyzer
                </NavItem>

                {/* Admin Link (visible only to admin users) */}
                {user.role === 'admin' && (
                  <NavItem to="/admin" active={isActive('/admin')}>
                    Admin
                  </NavItem>
                )}

                {/* User Info & Actions */}
                <div className="flex items-center pl-3 ml-2 border-l border-gray-300/50 dark:border-gray-600/50">
                  <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-3 px-4 py-2 text-[13px] font-medium text-red-600 dark:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-4 flex flex-col justify-between">
              <span className={`h-[2px] w-full bg-current rounded-full transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`h-[2px] w-full bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`h-[2px] w-full bg-current rounded-full transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-400 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Floating Menu */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-sm rounded-[32px] border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#181818]/80 shadow-[0_32px_64px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl backdrop-saturate-[180%] md:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen
            ? `top-28 opacity-100 scale-100`
            : `top-20 opacity-0 scale-95 pointer-events-none`
        }`}
      >
        <div className="p-4 space-y-1">
          {!user ? (
            <>
              <MobileLink to="/jobs" onClick={() => setMobileOpen(false)} active={isActive('/jobs')}>Find Jobs</MobileLink>
              <MobileLink to="/login" onClick={() => setMobileOpen(false)} active={isActive('/login')}>Login</MobileLink>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-2xl mt-3 active:scale-95 transition-transform"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center px-3 pb-4 mb-2 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-sm font-bold shadow-sm">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
                </div>
              </div>
              <MobileLink to="/jobs" onClick={() => setMobileOpen(false)} active={isActive('/jobs')}>Jobs</MobileLink>
              {user.role === 'employer' ? (
                <>
                  <MobileLink to="/post-job" onClick={() => setMobileOpen(false)} active={isActive('/post-job')}>Post Job</MobileLink>
                  <MobileLink to="/my-jobs" onClick={() => setMobileOpen(false)} active={isActive('/my-jobs')}>My Jobs</MobileLink>
                </>
              ) : (
                <MobileLink to="/my-applications" onClick={() => setMobileOpen(false)} active={isActive('/my-applications')}>Applications</MobileLink>
              )}

              {/* Mobile: Resume Analyzer Link */}
              <MobileLink to="/resume/upload" onClick={() => setMobileOpen(false)} active={isActive('/resume/upload')}>
                Resume Analyzer
              </MobileLink>

              {/* Mobile: Admin Link */}
              {user.role === 'admin' && (
                <MobileLink to="/admin" onClick={() => setMobileOpen(false)} active={isActive('/admin')}>
                  Admin Panel
                </MobileLink>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left py-3.5 px-4 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors mt-2"
              >
                Logout
              </button>
            </>
          )}
          
          <button
            onClick={() => { toggleDarkMode(); setMobileOpen(false); }}
            className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors mt-2"
          >
            <span>Appearance</span>
            <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

// ---- iOS Style Segmented Control Item ----
const NavItem = ({ to, active, children }) => (
  <Link
    to={to}
    className={`relative px-4 py-2 text-[13px] font-semibold transition-all duration-300 ease-out rounded-full ${
      active
        ? 'text-gray-900 dark:text-white bg-black/5 dark:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
    }`}
    aria-current={active ? 'page' : undefined}
  >
    {children}
  </Link>
);

// ---- Mobile iOS Style Menu Link ----
const MobileLink = ({ to, onClick, active, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`block py-3.5 px-4 rounded-2xl text-sm font-medium transition-colors ${
      active
        ? 'bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
    }`}
    aria-current={active ? 'page' : undefined}
  >
    {children}
  </Link>
);

export default Navbar;