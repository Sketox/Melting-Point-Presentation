'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Home,
  BarChart3,
  Table2,
  Brain,
  Info,
  Menu,
  X,
  Github,
  ExternalLink,
  LogIn,
  LogOut,
  User,
  FileText,
  Settings,
} from 'lucide-react';
import { getStoredUser, logout, User as UserType } from '@/lib/api';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/predictions', label: 'Predicciones', icon: Table2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/decision-support', label: 'Decision', icon: FileText },
  { href: '/model', label: 'Modelo', icon: Brain },
  { href: '/about', label: 'Acerca de', icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for logged in user
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, [pathname]); // Re-check on page change

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setShowUserMenu(false);
    router.push('/');
  };

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-claude-bg/95 backdrop-blur-lg border-b border-claude-border shadow-lg' 
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-claude-orange to-claude-orange-dark flex items-center justify-center transition-transform group-hover:scale-110">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-claude-orange/30 rounded-xl blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-claude-text">
                  Melting<span className="text-claude-orange">Point</span>
                </h1>
                <p className="text-[10px] text-claude-text-muted -mt-1">Competencia Kaggle</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium
                      flex items-center gap-2 transition-all duration-200
                      ${isActive 
                        ? 'text-claude-orange' 
                        : 'text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-claude-orange/10 border border-claude-orange/30 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.kaggle.com/competitions/melting-point/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  hidden md:flex items-center gap-2 px-3 py-2
                  rounded-lg border border-claude-border
                  text-claude-text-secondary hover:text-claude-text
                  hover:border-claude-orange/50 transition-all text-sm
                "
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden xl:inline">Kaggle</span>
              </a>
              <a
                href="https://github.com/Sketox/Melting-Point"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  hidden sm:flex items-center gap-2 px-3 py-2
                  rounded-lg bg-claude-orange/10 border border-claude-orange/20
                  text-claude-orange hover:bg-claude-orange/20
                  transition-all text-sm font-medium
                "
              >
                <Github className="w-4 h-4" />
                <span className="hidden xl:inline">GitHub</span>
              </a>

              {/* Auth Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-claude-border hover:border-claude-orange/50 transition-all text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-claude-orange/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-claude-orange" />
                    </div>
                    <span className="hidden md:inline text-claude-text font-medium">
                      {user.username}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 py-2 bg-claude-bg-secondary border border-claude-border rounded-xl shadow-xl"
                      >
                        <div className="px-4 py-2 border-b border-claude-border">
                          <p className="text-claude-text font-medium">{user.username}</p>
                          <p className="text-claude-text-muted text-xs truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="w-full flex items-center gap-2 px-4 py-2 text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary transition-colors text-sm"
                        >
                          <Settings className="w-4 h-4" />
                          Editar perfil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-claude-border hover:border-claude-orange text-claude-text hover:text-claude-orange transition-all text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-claude-bg-secondary transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-claude-text" />
                ) : (
                  <Menu className="w-6 h-6 text-claude-text" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 lg:hidden"
          >
            <div className="bg-claude-bg/98 backdrop-blur-lg border-b border-claude-border shadow-xl">
              <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${isActive
                          ? 'bg-claude-orange/10 text-claude-orange border border-claude-orange/30'
                          : 'text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Mobile Auth Section */}
                <div className="border-t border-claude-border mt-2 pt-2">
                  {user ? (
                    <>
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-claude-orange/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-claude-orange" />
                        </div>
                        <div>
                          <p className="text-claude-text font-medium">{user.username}</p>
                          <p className="text-claude-text-muted text-xs">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Editar perfil</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar sesion</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-claude-orange hover:bg-claude-orange/10 transition-colors"
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">Login</span>
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}