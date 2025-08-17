import React, { useRef, useEffect, useState } from 'react';

interface AvatarVideoProps {
  avatarState: 'idle' | 'talking' | 'listening';
  isConnected: boolean;
}

const AvatarVideo: React.FC<AvatarVideoProps> = ({ avatarState, isConnected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lipSyncIntensity, setLipSyncIntensity] = useState(0);
  const [breathingScale, setBreathingScale] = useState(1);

  // Breathing animation effect
  useEffect(() => {
    const breathingInterval = setInterval(() => {
      setBreathingScale(prev => {
        const newScale = 1 + Math.sin(Date.now() * 0.001) * 0.005;
        return newScale;
      });
    }, 50);

    return () => clearInterval(breathingInterval);
  }, []);

  // Lip sync animation based on avatar state
  useEffect(() => {
    if (avatarState === 'talking') {
      const lipSyncInterval = setInterval(() => {
        setLipSyncIntensity(Math.random() * 0.8 + 0.2);
      }, 150);
      return () => clearInterval(lipSyncInterval);
    } else {
      setLipSyncIntensity(0);
    }
  }, [avatarState]);

  const getLipSyncStyle = () => {
    if (avatarState !== 'talking') return {};
    
    return {
      transform: `scaleY(${1 + lipSyncIntensity * 0.3})`,
      transition: 'transform 0.1s ease-in-out',
    };
  };

  const getAvatarStyle = () => {
    const baseScale = breathingScale;
    const talkingScale = avatarState === 'talking' ? 1.02 : 1;
    const listeningScale = avatarState === 'listening' ? 1.01 : 1;
    
    return {
      transform: `scale(${baseScale * talkingScale * listeningScale})`,
      transition: 'transform 0.3s ease-in-out',
    };
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
      
      {/* Avatar Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Avatar Image with enhanced styling */}
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          style={getAvatarStyle()}
        >
          <img
            src="/assets/avatar.jpeg"
            alt="Wealth Management Advisor"
            className="w-full h-full object-cover"
            style={getLipSyncStyle()}
          />
          
          {/* Subtle glow effect when talking */}
          {avatarState === 'talking' && (
            <div className="absolute inset-0 bg-blue-400/10 animate-pulse"></div>
          )}
        </div>

        {/* Professional border overlay */}
        <div className="absolute inset-0 border-2 border-white/10 rounded-2xl"></div>
      </div>

      {/* Connection Status Overlay */}
      {!isConnected && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="text-white text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-blue-300 border-t-transparent animate-ping"></div>
            </div>
            <p className="text-lg font-medium">Connecting to AI...</p>
            <p className="text-sm text-gray-300 mt-1">Please wait</p>
          </div>
        </div>
      )}

      {/* Enhanced Status Indicator */}
      {isConnected && (
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
            avatarState === 'talking' 
              ? 'bg-green-500/90 text-white border border-green-400/50' :
            avatarState === 'listening' 
              ? 'bg-blue-500/90 text-white border border-blue-400/50' :
              'bg-gray-500/90 text-white border border-gray-400/50'
          }`}>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                avatarState === 'talking' ? 'bg-green-300 animate-pulse' :
                avatarState === 'listening' ? 'bg-blue-300 animate-pulse' :
                'bg-gray-300'
              }`}></div>
              <span>
                {avatarState === 'talking' ? 'Speaking' :
                 avatarState === 'listening' ? 'Listening' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Lip-sync Animation */}
      {avatarState === 'talking' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Mouth area lip sync */}
          <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/80 rounded-full animate-pulse"
                  style={{
                    height: `${2 + lipSyncIntensity * 4}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.3s'
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Subtle facial animation indicators */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}

      {/* Listening animation */}
      {avatarState === 'listening' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-400/60 rounded-full"
                  style={{
                    height: '8px',
                    animation: 'listening-wave 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.3}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Professional watermark */}
      <div className="absolute bottom-3 right-3">
        <div className="text-white/30 text-xs font-medium">
          AI Advisor
        </div>
      </div>

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
    </div>
  );
};

export default AvatarVideo; 