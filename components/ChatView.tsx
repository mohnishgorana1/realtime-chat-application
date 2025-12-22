"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  ChevronLeft,
} from "lucide-react";
import { useAppUser } from "@/context/UserContext";
import Image from "next/image";
import axios from "axios";

// --- Sub-Component: Chat Header ---
const ChatHeader = ({
  otherUser,
  onBack,
}: {
  otherUser: any;
  onBack: () => void;
}) => (
  <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/50 backdrop-blur-md sticky top-0 z-10">
    <div className="flex items-center gap-2 md:gap-4">
      {/* BACK BUTTON: Sirf mobile par dikhega aur layout ka part hoga */}
      <button
        onClick={onBack}
        className="md:hidden p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="flex items-center gap-3">
        {otherUser?.avatar ? (
          <Image
            src={otherUser.avatar}
            width={40}
            height={40}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover border border-primary/20"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
            {otherUser?.name?.[0] || "?"}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-bold text-sm md:text-base leading-none truncate uppercase tracking-tight">
            {otherUser?.name || "Select a Chat"}
          </h3>
          <span className="text-[10px] text-green-500 font-medium animate-pulse">
            Online
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
      <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
        <Phone size={18} />
      </button>
      <button className="hidden sm:block p-2 hover:bg-secondary rounded-xl transition-colors">
        <Video size={18} />
      </button>
      <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
  </header>
);

// --- Main ChatView Component ---
export default function ChatView({
  activeChat,
  onBack,
}: {
  activeChat: any;
  onBack: () => void;
}) {
  const { appUser } = useAppUser();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Samne wale user ka data nikalna
  const otherUser = activeChat?.participants?.find(
    (p: any) => p._id !== appUser?._id
  );

  // 1. Fetch Messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat?._id) return;
      setLoading(true);
      console.log("Fetching messages for chat:", activeChat._id);
      try {
        const res = await axios.get(`/api/messages/${activeChat._id}`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [activeChat?._id]);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Send Message Logic
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat?._id) return;

    const messageData = {
      chatId: activeChat._id,
      senderId: appUser?._id,
      content: newMessage,
    };

    try {
      setNewMessage(""); // Clear input immediately
      const res = await axios.post("/api/messages/send", messageData);
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-secondary/10">
        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center shadow-inner">
          <Send size={32} className="opacity-10" />
        </div>
        <p className="text-sm font-medium opacity-50">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden gap-x-2">
      {/* onBack pass kar rahe hain header ko */}
      <ChatHeader otherUser={otherUser} onBack={onBack} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30 dark:bg-zinc-950/30 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full opacity-30 text-xs uppercase tracking-tighter">
            Loading messages...
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.sender._id === appUser?._id || msg.sender === appUser?._id;
            return (
              <div
                key={msg._id || index}
                className={`flex gap-3 max-w-[85%] ${
                  isMe ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full shrink-0 mt-auto flex items-center justify-center text-[10px] font-bold border ${
                    isMe
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border"
                  }`}
                >
                  {isMe ? "ME" : otherUser?.name?.[0]}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm shadow-sm border ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none border-primary/20 shadow-primary/10"
                      : "bg-secondary/80 text-foreground rounded-bl-none border-border/50"
                  }`}
                >
                  {msg.content}
                  <div
                    className={`text-[9px] mt-1 opacity-50 text-right ${
                      isMe ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* MEssage input */}

      <div className="p-4 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-secondary/50 p-2 rounded-2xl border border-border focus-within:border-primary transition-all">
          <button className="p-2 hover:text-primary transition-colors text-muted-foreground">
            <Smile size={20} />
          </button>
          <button className="p-2 hover:text-primary transition-colors text-muted-foreground">
            <Paperclip size={20} />
          </button>
          <textarea
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Write a message..."
            className="flex-1 bg-transparent border-none outline-none resize-none py-2 text-sm max-h-32"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
