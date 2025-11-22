import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Gift, Lock } from 'lucide-react';

const Wheel = ({ prizes, type, cost, hasKey, onSpinComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();

  // Colors for the segments (Alternating Theme Colors)
  const colors = [
    '#00FFFF', // Cyan 500
    '#E0FFFF', // Cyan 100
    '#00CCCC', // Cyan 600
    '#F0FFFF', // Cyan 50
    '#00FFFF', // Cyan 500
    '#E0FFFF', // Cyan 100
    '#00CCCC', // Cyan 600
    '#F0FFFF', // Cyan 50
  ];

  const handleSpin = async () => {
    if (!hasKey || isSpinning) return;

    setIsSpinning(true);

    // 1. Determine the result RANDOMLY (Simulating backend)
    // In a real app, this index comes from an API response
    const winningIndex = Math.floor(Math.random() * prizes.length);
    const prizeValue = prizes[winningIndex];

    // 2. Calculate Rotation
    // One full rotation = 360 deg
    // Segment angle = 360 / prizes.length
    // We want to spin at least 5 times (1800 deg)
    // Then land on the specific segment.
    // Note: The pointer is at the TOP (0deg). 
    // To land index 0 at top, rotation is 0 (or 360).
    // To land index 1, we need to rotate -segmentAngle.
    
    const segmentAngle = 360 / prizes.length;
    // Add random jitter inside the segment so it doesn't always land perfectly in center
    const randomOffset = Math.floor(Math.random() * (segmentAngle - 10)) + 5; 
    
    // The calculation to land the specific index under the needle (at 0deg top)
    // We rotate backwards to bring the target to top
    const targetRotation = 360 * 5 + (360 - (winningIndex * segmentAngle)) + randomOffset;

    // 3. Animate
    await controls.start({
      rotate: targetRotation,
      transition: {
        duration: 4,
        ease: [0.15, 0.85, 0.35, 1], // Custom bezier for "Spin up -> Slow down" physics
      }
    });

    // 4. Finish
    setIsSpinning(false);
    
    // Reset rotation visually to 0 (mod 360) instantly so next spin is clean? 
    // Or just keep adding up. Keeping adding up is smoother.
    // For this demo, we just trigger the win.
    onSpinComplete(prizeValue);
  };

  return (
    <div className="flex flex-col items-center mb-8">
      {/* Wheel Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72">
        
        {/* Pointer / Needle */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-slate-800"></div>
        </div>

        {/* The Rotating Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-[6px] border-white shadow-2xl overflow-hidden relative"
          animate={controls}
          style={{
            // Create segments dynamically using conic-gradient
            background: `conic-gradient(
              ${prizes.map((_, i) => `${colors[i % colors.length]} ${i * (360/prizes.length)}deg ${(i+1) * (360/prizes.length)}deg`).join(', ')}
            )`
          }}
        >
          {/* Render Numbers inside segments */}
          {prizes.map((prize, i) => {
            const angle = (360 / prizes.length) * i + (360 / prizes.length) / 2; // Center of segment
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 text-xs font-heavy text-slate-800 w-full text-center"
                style={{
                  // Rotate to the segment, then push out to edge
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-80px)` // -80px pushes text to rim
                }}
              >
                <span className="bg-white/40 px-1 rounded backdrop-blur-sm">
                  {prize}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Center Spin Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleSpin}
            disabled={!hasKey || isSpinning}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all
              ${!hasKey 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white hover:scale-105 active:scale-95'
              }
            `}
          >
            {!hasKey ? (
              <Lock size={20} />
            ) : (
              <span className="font-heavy text-sm tracking-wider">SPIN</span>
            )}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center">
        <div className="text-lg font-heavy text-slate-700">{type} Wheel</div>
        {!hasKey ? (
          <p className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full inline-block mt-1">
            Key Required
          </p>
        ) : (
          <p className="text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full inline-block mt-1 flex items-center gap-1">
             <Gift size={12} /> Ready to Spin
          </p>
        )}
      </div>
    </div>
  );
};

export default Wheel;