'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, User, Briefcase, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'About', url: '/about', icon: User },
  { name: 'Portfolio', url: '/portfolio', icon: Briefcase },
  { name: 'Contact', url: '/contact', icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(navItems[0].name);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Update active tab based on URL path
    const matched = navItems.find((item) => item.url === pathname);
    if (matched) {
      setActiveTab(matched.name);
    }
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/80 backdrop-blur-sm pointer-events-auto flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center h-16">
        <div className="flex justify-center items-center h-16 w-full">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 transition mr-8">
            Karthik Narambhatla
          </Link>
          {/* Tubelight Nav - Desktop */}
          <div className="hidden md:flex items-center gap-3 bg-background/5 border-0 backdrop-blur-lg rounded-full shadow-lg h-16 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <Link
                  key={item.name}
                  href={item.url}
                  className={cn(
                    "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors flex items-center h-12",
                    "text-foreground/80 hover:text-primary",
                    isActive && "bg-muted text-primary"
                  )}
                >
                  <span className="hidden md:inline">{item.name}</span>
                  <span className="md:hidden">
                    <Icon size={18} strokeWidth={2.5} />
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="lamp"
                      className="absolute inset-0 w-full bg-white/10 rounded-full -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full">
                        <div className="absolute w-12 h-6 bg-white/30 rounded-full blur-md -top-2 -left-2" />
                        <div className="absolute w-8 h-6 bg-white/20 rounded-full blur-md -top-1" />
                        <div className="absolute w-4 h-4 bg-white/20 rounded-full blur-sm top-0 left-2" />
                      </div>
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-black/95 border-t border-white/10 z-40">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.url}
                className={cn(
                  "block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-full",
                  activeTab === item.name && "bg-muted text-primary"
                )}
                onClick={() => {
                  setActiveTab(item.name);
                  setIsOpen(false);
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <item.icon size={18} strokeWidth={2.5} />
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
