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
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [streamingUserMessage, setStreamingUserMessage] = useState<string>('');
  
  const wsRef = useRef<WebSocket | null>(null);

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
        const userMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          sender: 'user',
          timestamp: new Date(data.timestamp * 1000)
        };
        setMessages(prev => [...prev, userMessage]);
        setStreamingUserMessage('');
        break;

      case 'avatar_start':
        setAvatarState('talking');
        break;

      case 'avatar_chunk':
        // Add text to streaming response
        setStreamingResponse(prev => prev + data.chunk);
        break;

      case 'avatar_message':
        const avatarMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          sender: 'avatar',
          timestamp: new Date(data.timestamp * 1000)
        };
        setMessages(prev => [...prev, avatarMessage]);
        setStreamingResponse('');
        break;

      case 'avatar_end':
        setAvatarState('idle');
        break;

      case 'voice_started':
        setIsListening(true);
        setAvatarState('listening');
        break;

      case 'voice_stopped':
        setIsListening(false);
        setAvatarState('idle');
        setStreamingUserMessage('');
        break;
    }
  };

  const sendMessage = (message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected');
      return;
    }

    console.log(' Sending message to backend:', message);
    wsRef.current.send(JSON.stringify({
      type: 'text',
      message: message
    }));
  };

  const startVoiceChat = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected');
      return;
    }

    console.log('🎤 Starting voice chat');
    wsRef.current.send(JSON.stringify({
      type: 'voice_start'
    }));

    // Trigger avatar introduction after a short delay
    setTimeout(() => {
      console.log('🎯 Triggering avatar introduction');
      wsRef.current?.send(JSON.stringify({
        type: 'text',
        message: 'introduction_request'
      }));
    }, 1000); // 1 second delay
  };

  const stopVoiceChat = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected');
      return;
    }

    console.log('🛑 Stopping voice chat');
    wsRef.current.send(JSON.stringify({
      type: 'voice_stop'
    }));
  };

  const interruptVoiceChat = () => {
    console.log('⏸️ Interrupting voice chat');
    stopVoiceChat();
  };

  // Handle streaming transcription from voice chat
  const handleStreamingTranscription = (text: string) => {
    console.log(' Received streaming transcription:', text);
    setStreamingUserMessage(text);
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
          onInterruptVoice={interruptVoiceChat}
          onStreamingTranscription={handleStreamingTranscription}
          isListening={isListening}
          isConnected={isConnected}
          isAvatarSpeaking={false} // Always false since we removed audio
        />
      </div>
      
      <MessageHistory 
        messages={messages} 
        streamingResponse={streamingResponse}
        streamingUserMessage={streamingUserMessage}
        isStreaming={streamingResponse.length > 0 || streamingUserMessage.length > 0}
      />
    </div>
  );
};

export default InteractiveAvatar; 