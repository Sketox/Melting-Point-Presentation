'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Flame, 
  Home,
  BarChart3,
  Table2,
  Brain,
  Info,
  Code,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  Bookmark
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/predictions', label: 'Predicciones', icon: Table2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/model', label: 'Modelo', icon: Brain },
  { href: '/my-predictions', label: 'Mis Predicciones', icon: Bookmark, authRequired: true },
  { href: '/about', label: 'Acerca de', icon: Info },
  { href: '/api-docs', label: 'API', icon: Code },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                // Skip auth-required items if not authenticated
                if (item.authRequired && !isAuthenticated) return null;
                
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
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="
                      flex items-center gap-2 px-3 py-2 
                      rounded-lg border border-claude-border
                      text-claude-text-secondary hover:text-claude-text
                      hover:border-claude-orange/50 transition-all text-sm
                    "
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">{user?.username}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="
                      flex items-center gap-2 px-3 py-2 
                      rounded-lg border border-claude-border
                      text-claude-text-secondary hover:text-red-500
                      hover:border-red-500/50 transition-all text-sm
                    "
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="
                      flex items-center gap-2 px-3 py-2 
                      rounded-lg border border-claude-border
                      text-claude-text-secondary hover:text-claude-text
                      hover:border-claude-orange/50 transition-all text-sm
                    "
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden xl:inline">Iniciar Sesión</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="
                      flex items-center gap-2 px-3 py-2 
                      rounded-lg bg-claude-orange/10 border border-claude-orange/20
                      text-claude-orange hover:bg-claude-orange/20
                      transition-all text-sm font-medium
                    "
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">Registrarse</span>
                  </Link>
                </div>
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
                  // Skip auth-required items if not authenticated
                  if (item.authRequired && !isAuthenticated) return null;
                  
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
                
                {/* Mobile Auth Links */}
                <div className="pt-2 mt-2 border-t border-claude-border">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        className="
                          flex items-center gap-3 px-4 py-3 rounded-xl
                          text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary
                          transition-all
                        "
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">{user?.username}</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="
                          w-full flex items-center gap-3 px-4 py-3 rounded-xl
                          text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30
                          transition-all
                        "
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="
                          flex items-center gap-3 px-4 py-3 rounded-xl
                          text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary
                          transition-all
                        "
                      >
                        <LogIn className="w-5 h-5" />
                        <span className="font-medium">Iniciar Sesión</span>
                      </Link>
                      <Link
                        href="/auth/register"
                        className="
                          flex items-center gap-3 px-4 py-3 rounded-xl
                          bg-claude-orange/10 text-claude-orange border border-claude-orange/30
                          hover:bg-claude-orange/20 transition-all
                        "
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Registrarse</span>
                      </Link>
                    </>
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