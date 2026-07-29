'use client';

import React from 'react';

export const EnterpriseBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {/* Subtle Dot Grid Pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      {/* Soft Vignette & Radial Glow */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#090D16]/40 to-[#090D16]" />
    </div>
  );
};
