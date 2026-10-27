import React, { useMemo } from 'react';

interface Petal {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  rotation: number;
  opacity: number;
}

export const PetalCanvas: React.FC = () => {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 9 + Math.random() * 8, // 9s to 17s
      animationDelay: Math.random() * 10,
      size: 14 + Math.random() * 16,
      rotation: Math.random() * 360,
      opacity: 0.55 + Math.random() * 0.35,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-petal"
          style={{
            left: `${petal.left}%`,
            top: '-20px',
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.animationDelay}s`,
            opacity: petal.opacity,
          }}
        >
          {/* SVG Rose Petal */}
          <svg
            width={petal.size}
            height={petal.size * 1.3}
            viewBox="0 0 30 40"
            fill="none"
            style={{ transform: `rotate(${petal.rotation}deg)` }}
          >
            <path
              d="M15 2C7 6 2 16 3 26C4 34 10 39 15 39C20 39 26 34 27 26C28 16 23 6 15 2Z"
              fill="url(#petal-grad)"
            />
            <defs>
              <linearGradient id="petal-grad" x1="0" y1="0" x2="30" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C084FC" />
                <stop offset="0.55" stopColor="#9333EA" />
                <stop offset="1" stopColor="#581C87" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  );
};
