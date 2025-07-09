import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';
import { Home, User, Briefcase, FileText } from 'lucide-react';
import { NavBarWrapper } from '../components/NavBarWrapper';

export const metadata: Metadata = {
  title: 'Karthik Narambhatla - Portfolio',
  description: 'Professional photography portfolio showcasing weddings, fashion, and street photography.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '/about', icon: User },
    { name: 'Portfolio', url: '/portfolio', icon: Briefcase },
    { name: 'Resume', url: '/resume', icon: FileText },
  ];
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />
        <main className="pt-16 pb-24">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
} 