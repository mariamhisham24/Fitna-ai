"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChatContextType = {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  defaultContext: 'visitor' | 'teacher';
  setDefaultContext: (context: 'visitor' | 'teacher') => void;
};

const ChatBotContext = createContext<ChatContextType | undefined>(undefined);

export function ChatBotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultContext, setDefaultContext] = useState<'visitor' | 'teacher'>('visitor');

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <ChatBotContext.Provider 
      value={{ 
        isOpen, 
        openChat, 
        closeChat, 
        toggleChat, 
        defaultContext, 
        setDefaultContext 
      }}
    >
      {children}
    </ChatBotContext.Provider>
  );
}

export function useChatBot() {
  const context = useContext(ChatBotContext);
  if (context === undefined) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
}
