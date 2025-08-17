import React, { useState, useEffect } from 'react';

interface AvatarVideoProps {
  avatarState: 'idle' | 'talking' | 'listening';
  isConnected: boolean;
}

const AvatarVideo: React.FC<AvatarVideoProps> = ({ 
  avatarState, 
  isConnected 
}) => {
  const [breathingScale, setBreathingScale] = useState(1);

  // Breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingScale(prev => 1 + Math.sin(Date.now() * 0.001) * 0.02);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getAvatarStyle = () => ({
    transform: `scale(${breathingScale})`,
    transition: 'transform 0.5s ease-in-out'
  });

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 animate-subtle-glow"></div>
      
      {/* Avatar Image - Clean version without extra circles */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div 
          className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white/20"
          style={getAvatarStyle()}
        >
          <img
            src="/assets/avatar.jpeg"
            alt="Max - Wealth Management Advisor"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to "M" if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center"><div class="text-white text-6xl font-bold">M</div></div>';
            }}
          />
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
          isConnected 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            {isConnected && (
              <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            )}
          </div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Avatar Info */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">Max</h3>
              <p className="text-gray-300 text-sm">Wealth Management Advisor</p>
            </div>
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span>{isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* State Indicator */}
      {avatarState === 'listening' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-red-500 rounded-full animate-listening-wave"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarVideo; 