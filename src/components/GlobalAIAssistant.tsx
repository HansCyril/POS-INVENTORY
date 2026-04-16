'use client';
import { useState } from 'react';
import AIAssistant from './AIAssistant';
import { Bot } from 'lucide-react';

export default function GlobalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all duration-300 z-50 group border border-white/10 backdrop-blur-sm animate-fade-in-up"
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <Bot className="w-7 h-7 relative z-10" />
          
          {/* Notification ping */}
          <span className="absolute top-0 right-0 w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full w-3 h-3 bg-purple-500"></span>
          </span>
        </button>
      )}
    </>
  );
}
