"use client";
import React, { useState, useEffect } from "react";
import MessagesSidebar from "@/components/MessagesSidebar";
import ChatView from "@/components/ChatView";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import { useAppUser } from "@/context/UserContext";

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const handleBack = () => setSelectedChat(null);

  return (
    <main className="flex h-[calc(100vh-110px)] overflow-hidden bg-background border border-border rounded-3xl mb-4 shadow-xl ">
      {/* SIDEBAR: Mobile par tabhi dikhega jab koi chat selected NA HO */}
      <div
        className={`
        ${selectedChat ? "hidden" : "flex"} 
        md:flex w-full md:w-87.5 border-r border-border bg-card/30
      `}
      >
        <MessagesSidebar
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </div>

      {/* CHAT VIEW: Mobile par tabhi dikhega jab chat selected HO */}
      <section
        className={`
        ${selectedChat ? "flex" : "hidden"} 
        md:flex flex-1 flex-col h-full bg-background relative
      `}
      >
        {/* Back Button: Sirf Mobile par dikhega ChatView ke andar */}
        {selectedChat && (
          <div className="md:hidden absolute top-4 left-4 z-50">
            <button
              onClick={() => setSelectedChat(null)} // Wapas list par jaane ke liye
              className="p-2 bg-secondary rounded-full shadow-md"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}

        <ChatView activeChat={selectedChat} onBack={handleBack} />
      </section>
    </main>
  );
}
