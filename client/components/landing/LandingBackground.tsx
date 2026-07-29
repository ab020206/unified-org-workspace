'use client';

import React from 'react';

export const LandingBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Light neutral backdrop */}
      <div className="absolute inset-0 bg-[#F2F2F2]" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `linear-gradient(to right, #D9D9D9 1px, transparent 1px), linear-gradient(to bottom, #D9D9D9 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 20%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 20%, #000 70%, transparent 100%)',
        }}
      />

      {/* Top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#D9D9D9] to-transparent" />
    </div>
  );
};
