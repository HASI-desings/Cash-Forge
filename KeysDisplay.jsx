import React from 'react';
import { Key } from 'lucide-react';

const KeysDisplay = ({ keys }) => {
  // Configuration for the visual style of each key tier
  const tiers = [
    {
      id: 'bronze',
      label: 'Bronze',
      count: keys.bronze,
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      iconGradient: 'from-orange-400 to-orange-600',
      border: 'border-orange-200'
    },
    {
      id: 'gold',
      label: 'Gold',
      count: keys.gold,
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      iconGradient: 'from-yellow-400 to-yellow-600',
      border: 'border-yellow-200'
    },
    {
      id: 'diamond',
      label: 'Diamond',
      count: keys.diamond,
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      iconGradient: 'from-cyan-400 to-cyan-600',
      border: 'border-cyan-200'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {tiers.map((tier) => (
        <div 
          key={tier.id}
          className={`glass-panel rounded-2xl p-3 flex flex-col items-center justify-center border-2 ${tier.border} ${tier.bg} relative overflow-hidden`}
        >
          {/* Background Shine Effect */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/20 rounded-full -mr-6 -mt-6 blur-xl"></div>

          {/* Key Icon Bubble */}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tier.iconGradient} flex items-center justify-center shadow-md mb-2 text-white`}>
            <Key size={18} className="drop-shadow-sm" />
          </div>

          {/* Count */}
          <div className={`text-2xl font-heavy ${tier.text}`}>
            {tier.count}
          </div>

          {/* Label */}
          <div className={`text-[10px] font-bold uppercase tracking-wider opacity-80 ${tier.text}`}>
            {tier.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KeysDisplay;