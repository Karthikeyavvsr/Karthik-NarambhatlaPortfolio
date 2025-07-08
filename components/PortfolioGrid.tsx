"use client";

import React from 'react';
import Link from 'next/link';

const categories = [
  {
    key: 'landscapes',
    label: 'Landscapes',
    href: '/portfolio/landscapes',
    comingSoon: false,
  },
  {
    key: 'interiors',
    label: 'Interiors',
    href: '/portfolio/interiors',
    comingSoon: true,
  },
  {
    key: 'restaurant',
    label: 'Restaurant',
    href: '/portfolio/restaurant',
    comingSoon: true,
  },
  {
    key: 'restrobar',
    label: 'Restro Bar',
    href: '/portfolio/restrobar',
    comingSoon: true,
  },
];

const placeholder = '/photos/landscapes/IMG_0341.jpg';

export default function PortfolioGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center items-center min-h-[300px]">
      {categories.map((cat) => (
        <Link href={cat.href} key={cat.key} className="block group w-full max-w-xs mx-auto">
          <div className="relative overflow-hidden rounded-lg shadow-lg bg-gray-800 aspect-[4/5] cursor-pointer">
            <img
              src={placeholder}
              alt={`${cat.label} Thumbnail`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/poster.jpg';
              }}
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white text-lg font-semibold mb-1">{cat.label}</h3>
              {cat.key === 'landscapes' ? (
                <p className="text-gray-300 text-xs">Chasing altitude and atmosphere — a visual journal from the peaks of Manali.</p>
              ) : (
                <p className="text-gray-400 text-xs italic">Coming Soon</p>
              )}
            </div>
            {cat.comingSoon && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-white text-lg font-bold">Coming Soon</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
} 