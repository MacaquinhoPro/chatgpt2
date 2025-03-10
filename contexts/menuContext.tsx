// app/menuContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { nanoid } from "nanoid/non-secure";
import { Keyboard } from "react-native";

export type Conversation = {
  id: string;
  title: string;
};

export type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

type MenuContextType = {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  conversations: Conversation[];
  createConversation: () => string;
  removeConversation: (id: string) => void;
  updateConversationTitle: (id: string, newTitle: string) => void;
  conversationHistories: { [key: string]: Message[] };
  addMessage: (conversationId: string, message: Message) => void;
  updateConversationHistory: (conversationId: string, messages: Message[]) => void;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationHistories, setConversationHistories] = useState<{
    [key: string]: Message[];
  }>({});

  // Al abrir/cerrar el menú se oculta el teclado
  const toggleMenu = () => {
    Keyboard.dismiss();
    setIsMenuOpen((prev) => !prev);
  };

  const createConversation = () => {
    const newId = nanoid(6);
    setConversations((prev) => [...prev, { id: newId, title: "New Chat" }]);
    // Inicializa el historial vacío para esta conversación
    setConversationHistories((prev) => ({ ...prev, [newId]: [] }));
    return newId;
  };

  const removeConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setConversationHistories((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const updateConversationTitle = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversationHistories((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message],
    }));
  };

  // Nueva función para actualizar el historial completo de una conversación
  const updateConversationHistory = (conversationId: string, messages: Message[]) => {
    setConversationHistories((prev) => ({
      ...prev,
      [conversationId]: messages,
    }));
  };

  return (
    <MenuContext.Provider
      value={{
        isMenuOpen,
        toggleMenu,
        conversations,
        createConversation,
        removeConversation,
        updateConversationTitle,
        conversationHistories,
        addMessage,
        updateConversationHistory,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
