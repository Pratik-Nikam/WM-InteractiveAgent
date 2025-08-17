import React, { useState, useRef, useEffect } from 'react';
import AvatarVideo from './AvatarVideo';
import ChatControls from './ChatControls';
import MessageHistory from './MessageHistory';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'avatar';
  timestamp: Date;
  isStreaming?: boolean;
}

const InteractiveAvatar: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [avatarState, setAvatarState] = useState<'idle' | 'talking' | 'listening'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [currentUserMessage, setCurrentUserMessage] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws/chat');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to backend');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from backend');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'user_message':
        // Add user message to chat
        const userMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          sender: 'user',
          timestamp: new Date(data.timestamp * 1000)
        };
        setMessages(prev => [...prev, userMessage]);
        break;

      case 'avatar_start':
        setAvatarState('talking');
        setIsSpeaking(true);
        break;

      case 'avatar_chunk':
        // Handle streaming chunks
        setStreamingResponse(prev => prev + data.chunk);
        break;

      case 'avatar_message':
        // Final avatar message
        const avatarMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          sender: 'avatar',
          timestamp: new Date(data.timestamp * 1000)
        };
        setMessages(prev => [...prev, avatarMessage]);
        setStreamingResponse('');
        
        // Speak the response
        speakText(data.message);
        break;

      case 'avatar_end':
        setAvatarState('idle');
        setIsSpeaking(false);
        break;

      case 'voice_started':
        setIsListening(true);
        setAvatarState('listening');
        break;

      case 'voice_stopped':
        setIsListening(false);
        setAvatarState('idle');
        break;
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      if (speechRef.current) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      speechRef.current = utterance;
      
      // Configure speech settings
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      
      // Try to use a better voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setAvatarState('talking');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setAvatarState('idle');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setAvatarState('idle');
      };

      speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'text',
      message: text
    }));
  };

  const startVoiceChat = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'voice_start'
    }));
  };

  const stopVoiceChat = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'voice_stop'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-white mb-2">AI Wealth Management Advisor</h1>
        <p className="text-gray-400 text-sm">Your personal financial consultant</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Enhanced iPhone-style container */}
        <div className="relative">
          <div className="w-80 h-96 bg-gradient-to-br from-gray-800 to-black rounded-3xl border-8 border-gray-700 shadow-2xl overflow-hidden">
            <AvatarVideo 
              avatarState={avatarState}
              isConnected={isConnected}
            />
          </div>
          
          {/* Status indicator */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className={`w-4 h-4 rounded-full border-2 border-white ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          </div>
        </div>
        
        <ChatControls
          onSendMessage={sendMessage}
          onStartVoice={startVoiceChat}
          onStopVoice={stopVoiceChat}
          isListening={isListening}
          isConnected={isConnected}
          isAvatarSpeaking={isSpeaking}
        />
      </div>
      
      <MessageHistory 
        messages={messages} 
        streamingResponse={streamingResponse}
        isStreaming={streamingResponse.length > 0}
      />
    </div>
  );
};

export default InteractiveAvatar; 