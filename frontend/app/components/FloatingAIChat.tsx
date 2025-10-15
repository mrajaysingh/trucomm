"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaMinus, FaExpand } from 'react-icons/fa';
import { useMobileDetection } from '../hooks/useMobileDetection';

interface FloatingAIChatProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export default function FloatingAIChat({ isVisible = true, onToggle }: FloatingAIChatProps) {
  const { isMobile } = useMobileDetection();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [message, setMessage] = useState('');
  const [chatStarted, setChatStarted] = useState(false);

  // Don't show on mobile devices
  if (isMobile) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle?.();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setChatStarted(false);
  };

  const handleStartChat = () => {
    setChatStarted(true);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically send the message to your AI service
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && isVisible && (
        <div className="fixed left-6 bottom-6 z-50">
          <button
            onClick={handleToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative w-17 h-17 bg-transparent rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 flex items-center justify-center floating-chat-button cursor-default"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-full bg-blue-500/20 blur-lg transition-opacity duration-300 ${
              isHovered ? 'opacity-50' : 'opacity-0'
            }`} />
            
            {/* Logo */}
            <div className="relative z-10 w-14 h-14">
              <Image
                src="/logo/lummi/lummi-ai-chat-logo.svg"
                alt="AI Chat"
                width={54}
                height={54}
                className="w-full h-full"
                priority
              />
            </div>
            
            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-30" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed left-6 bottom-6 z-50 transition-all duration-300 chat-window-enter ${
          isMinimized ? 'w-68 h-14' : 'w-82 h-[425px]'
        }`}>
          <div className="bg-transparent backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 h-full flex flex-col cursor-default">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9">
                  <Image
                    src="/logo/lummi/lummi-ai-chat-logo.svg"
                    alt="AI Chat"
                    width={38}
                    height={38}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                  <p className="text-gray-400 text-xs">Online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMinimize}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors duration-200 cursor-default"
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors duration-200 cursor-default"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {!chatStarted ? (
                  /* Start Chat Interface */
                  <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto mb-4">
                        <Image
                          src="/logo/lummi/lummi-ai-chat-logo.svg"
                          alt="LUMMI"
                          width={64}
                          height={64}
                          className="w-full h-full"
                        />
                      </div>
                      <h2 className="text-white text-xl font-semibold mb-2">Chat with LUMMI</h2>
                      <p className="text-gray-300 text-sm">
                        Your AI assistant is ready to help you with TruComm
                      </p>
                    </div>
                    
                    <button
                      onClick={handleStartChat}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 cursor-default"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Start Chat
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto chat-messages">
                      <div className="space-y-4">
                        {/* Welcome Message */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <Image
                              src="/logo/lummi/lummi-ai-chat-logo.svg"
                              alt="AI"
                              width={27}
                              height={27}
                            />
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                            <p className="text-white text-sm">
                              Hello! I'm your AI assistant. How can I help you with TruComm today?
                            </p>
                          </div>
                        </div>

                        {/* Sample Messages */}
                        <div className="flex justify-end">
                          <div className="bg-blue-500 rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                            <p className="text-white text-sm">
                              What security features does TruComm offer?
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <Image
                              src="/logo/lummi/lummi-ai-chat-logo.svg"
                              alt="AI"
                              width={27}
                              height={27}
                            />
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                            <p className="text-white text-sm">
                              TruComm offers military-grade security with our proprietary BYOSS technology, dual AES-256 encryption, and 4-step server level EEE protection. Would you like to know more about any specific feature?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-200 cursor-default"
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={!message.trim()}
                          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors duration-200 cursor-default"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
