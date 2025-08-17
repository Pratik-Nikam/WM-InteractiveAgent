import React, { useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'avatar';
  timestamp: Date;
  isStreaming?: boolean;
}

interface MessageHistoryProps {
  messages: Message[];
  streamingResponse?: string;
  isStreaming?: boolean;
  currentUserMessage?: string;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({ 
  messages, 
  streamingResponse = '', 
  isStreaming = false,
  currentUserMessage = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse, currentUserMessage]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-64 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-gray-700 overflow-hidden">
      <div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.length === 0 && !isStreaming && !currentUserMessage ? (
          <div className="text-center text-gray-400 py-8">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">Ask your wealth management advisor about investments, retirement, or financial planning</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-gray-600/50'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className={`flex items-center justify-between mt-2 text-xs ${
                    message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    <span className="ml-2">
                      {message.sender === 'user' ? 'You' : 'AI Advisor'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Current user message (while speaking) */}
            {currentUserMessage && (
              <div className="flex justify-end animate-fade-in">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <p className="text-sm leading-relaxed">
                    {currentUserMessage}
                    <span className="animate-pulse">|</span>
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-blue-200">
                    <span>Now</span>
                    <span className="ml-2">You</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Streaming AI response */}
            {isStreaming && streamingResponse && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-gray-600/50">
                  <p className="text-sm leading-relaxed">
                    {streamingResponse}
                    <span className="animate-pulse">|</span>
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>Now</span>
                    <span className="ml-2">AI Advisor</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageHistory; 