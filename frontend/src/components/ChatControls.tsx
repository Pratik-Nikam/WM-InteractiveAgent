import React, { useState, useRef, useEffect } from 'react';

interface ChatControlsProps {
  onSendMessage: (message: string) => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onStreamingTranscription: (text: string) => void;
  onInterruptVoice: () => void;
  isListening: boolean;
  isConnected: boolean;
  isAvatarSpeaking: boolean;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  onSendMessage,
  onStartVoice,
  onStopVoice,
  onStreamingTranscription,
  onInterruptVoice,
  isListening,
  isConnected,
  isAvatarSpeaking
}) => {
  const [message, setMessage] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsTranscribing(true);
        setTranscription('');
        console.log(' Speech recognition started');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        setTranscription(fullTranscript);
        
        // Check for stop commands
        const lowerTranscript = fullTranscript.toLowerCase();
        if (lowerTranscript.includes('stop') || lowerTranscript.includes('stop listening') || lowerTranscript.includes('stop voice chat')) {
          console.log('🎯 Voice command detected: stop');
          stopVoiceChat();
          return;
        }
        
        // Show streaming transcription for interim results
        if (interimTranscript.trim()) {
          console.log('🔄 Streaming transcription:', fullTranscript);
          onStreamingTranscription(fullTranscript);
        }

        // Clear previous timeout and set new one
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // If we have a final transcript, set timeout to send after 3 seconds of silence
        if (finalTranscript.trim()) {
          console.log('⏰ Setting 3s timeout for:', finalTranscript.trim());
          silenceTimeoutRef.current = setTimeout(() => {
            if (finalTranscript.trim()) {
              console.log(' Sending message to backend after 3s silence:', finalTranscript.trim());
              onSendMessage(finalTranscript.trim());
              setTranscription(''); // Only clear the input field
            }
          }, 3000); // 3 seconds of silence
        }
      };

      recognition.onend = () => {
        setIsTranscribing(false);
        // Restart recognition if voice is still active
        if (isVoiceActive) {
          console.log('🔄 Restarting recognition');
          setTimeout(() => {
            if (isVoiceActive) {
              recognition.start();
            }
          }, 100);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsTranscribing(false);
      };
    }
  }, [isVoiceActive, onSendMessage, onStreamingTranscription]);

  const handleSendMessage = () => {
    if (message.trim() && isConnected) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceChat = async () => {
    if (!isConnected) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsVoiceActive(true);
      onStartVoice();
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      console.log(' Voice chat started - listening continuously');
    } catch (error) {
      console.error('Error starting voice chat:', error);
      alert('Please allow microphone access to use voice chat');
    }
  };

  const stopVoiceChat = () => {
    setIsVoiceActive(false);
    setTranscription('');
    setIsTranscribing(false);
    
    // Clear any pending timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    onStopVoice();
    console.log(' Voice chat stopped');
  };

  const interruptVoiceChat = () => {
    console.log('⏸️ Interrupting voice chat');
    
    // Clear any pending timeouts
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    // Stop voice chat
    stopVoiceChat();
    
    // Notify parent component
    onInterruptVoice();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="mt-8 w-full max-w-md">
      <div className="flex flex-col space-y-6">
        {/* Live Transcription Display */}
        {isVoiceActive && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Listening...</span>
            </div>
            <div className="text-white text-lg">
              {transcription || 'Start speaking...'}
            </div>
            {isTranscribing && (
              <div className="text-gray-400 text-sm mt-1">
                Processing...
              </div>
            )}
          </div>
        )}

        {/* Text Input */}
        <div className="relative">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or use voice chat..."
                className="w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 border-gray-600/50 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400"
                disabled={!isConnected}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!isConnected || !message.trim()}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Voice Chat Controls */}
        <div className="flex justify-center space-x-4">
          {/* Start/Stop Voice Chat Button */}
          <button
            onClick={isVoiceActive ? stopVoiceChat : startVoiceChat}
            disabled={!isConnected}
            className={`relative px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
              isVoiceActive
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
            } disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed`}
          >
            {isVoiceActive ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-white rounded-full animate-ping"></div>
                </div>
                <span>Stop Listening</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Start Voice Chat</span>
              </div>
            )}
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
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

          {isVoiceActive && (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span>Listening</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => onSendMessage("Tell me about retirement planning")}
            disabled={!isConnected || isVoiceActive}
            className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200 text-sm"
          >
            Retirement
          </button>
          <button
            onClick={() => onSendMessage("What investment options do you recommend?")}
            disabled={!isConnected || isVoiceActive}
            className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200 text-sm"
          >
            Investments
          </button>
          <button
            onClick={() => onSendMessage("How can I save on taxes?")}
            disabled={!isConnected || isVoiceActive}
            className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200 text-sm"
          >
            Tax Tips
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatControls; 