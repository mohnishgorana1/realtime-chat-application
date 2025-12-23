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
  Check,
  CheckCheck,
} from "lucide-react";
import { useAppUser } from "@/context/UserContext";
import Image from "next/image";
import axios from "axios";
import { pusherClient } from "@/lib/pusherClient";

// --- Sub-Component: Chat Header ---
const ChatHeader = ({
  otherUser,
  onBack,
  isOnline,
}: {
  otherUser: any;
  onBack: () => void;
  isOnline: boolean;
}) => (
  <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/50 backdrop-blur-md sticky top-0 z-10">
    <div className="flex items-center gap-2 md:gap-4">
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
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500 animate-pulse" : "bg-zinc-500"
              }`}
            />
            <span
              className={`text-[10px] font-medium ${
                isOnline ? "text-green-500" : "text-zinc-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
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
  const { appUser, onlineUsers } = useAppUser();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // typing indicators
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const otherUser = activeChat?.participants?.find(
    (p: any) => p._id !== appUser?._id
  );
  // Check if this specific user is online
  const isOnline = onlineUsers.includes(otherUser?._id);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat?._id || !appUser?._id) return;

    const contentToSend = newMessage; // Store content
    setNewMessage(""); // Clear immediately

    const tempId = Date.now().toString();
    const optimisticMsg = {
      _id: tempId,
      content: contentToSend,
      sender: { _id: appUser._id, name: appUser.name, avatar: appUser.avatar },
      chat: activeChat._id,
      readBy: [],
      createdAt: new Date().toISOString(),
      isSending: true,
      error: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Use contentToSend here
      const res = await axios.post("/api/messages/send", {
        chatId: activeChat._id,
        senderId: appUser._id,
        content: contentToSend,
      });

      if (res.data.success) {
        const realMsg = res.data.data;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? { ...realMsg, isSending: false } : m
          )
        );
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId ? { ...m, isSending: false, error: true } : m
        )
      );
    }
  };
  const markMessagesAsRead = async () => {
    if (!activeChat?._id || !appUser?._id) return;
    try {
      await axios.post("/api/messages/read", {
        chatId: activeChat._id,
        userId: appUser._id,
      });
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  // 1. Fetch Messages from API (Initial Load)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat?._id) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/messages/${activeChat._id}`);
        if (res.data.success) {
          // Check if response is res.data.data or res.data.messages based on your API
          setMessages(res.data.data || []);
          markMessagesAsRead(); // TODO: scalable hai ya nhi check krna hoga kyuki yeh to har inititla fetch pe read wali req krega
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [activeChat?._id]);

  // 2. Pusher Real-time Listener (Combined for Messages + Typing)
  useEffect(() => {
    if (!activeChat?._id || !appUser?._id) return;

    const channelName = `private-chat-${activeChat._id}`;
    const channel = pusherClient.subscribe(channelName);

    // A: Naya message aane par
    channel.bind("incoming-message", (incomingMsg: any) => {
      const isFromMe =
        incomingMsg.sender._id === appUser._id ||
        incomingMsg.sender === appUser._id;
      if (isFromMe) return;

      setMessages((prev) => {
        if (prev.find((m) => m._id === incomingMsg._id)) return prev;
        markMessagesAsRead();
        return [...prev, incomingMsg];
      });
    });

    // B: Tick update (Read status)
    channel.bind("messages-read", (data: { readerId: string }) => {
      if (data.readerId !== appUser._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            !msg.readBy.includes(data.readerId)
              ? { ...msg, readBy: [...msg.readBy, data.readerId] }
              : msg
          )
        );
      }
    });

    // C: Dusra user jab type kare (Typing Indicator ON)
    channel.bind("client-typing", (data: { userId: string }) => {
      if (data.userId !== appUser._id) setIsOtherUserTyping(true);
    });

    // D: Dusra user jab typing band kare (Typing Indicator OFF)
    channel.bind("client-stop-typing", (data: { userId: string }) => {
      if (data.userId !== appUser._id) setIsOtherUserTyping(false);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [activeChat?._id, appUser?._id]);

  // 2. Typing TRIGGER Logic
  useEffect(() => {
    if (!activeChat?._id || !appUser?._id || !newMessage) return;

    const channelName = `private-chat-${activeChat._id}`;
    const channel = pusherClient.subscribe(channelName);

    if (newMessage.length > 0) {
      // Send trigger
      channel.trigger("client-typing", { userId: appUser._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        channel.trigger("client-stop-typing", { userId: appUser._id });
      }, 2000);
    }
  }, [newMessage]); // Only watch newMessage here

  // 4 Typing Indicator
  useEffect(() => {
    if (!activeChat?._id || !appUser?._id) return;

    const channelName = `private-chat-${activeChat._id}`;
    const channel = pusherClient.subscribe(channelName);

    if (newMessage.trim().length > 0) {
      // Dusre ko batao main type kar raha hoon
      channel.trigger("client-typing", { userId: appUser._id });

      // Stop typing timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        channel.trigger("client-stop-typing", { userId: appUser._id });
      }, 2000);
    } else {
      // Agar text clear kar diya, toh turant stop-typing bhej do
      channel.trigger("client-stop-typing", { userId: appUser._id });
    }

    // Safai (Cleanup)
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [newMessage, activeChat?._id]);

  // 4. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-secondary/10">
        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center shadow-inner">
          <Send size={32} className="opacity-10 rotate-12" />
        </div>
        <p className="text-sm font-medium opacity-50 uppercase tracking-widest">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader otherUser={otherUser} onBack={onBack} isOnline={isOnline} />

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

            const isRead = msg.readBy.some(
              (id: string) => id === otherUser?._id
            );

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
                  className={`p-4 rounded-2xl text-sm shadow-sm border relative group ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none border-primary/20"
                      : "bg-secondary/80 text-foreground rounded-bl-none border-border/50"
                  }`}
                >
                  {msg.content}

                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 opacity-70 ${
                      isMe
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {/* Time */}
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {/* TICKS / Status Area */}
                    {isMe && (
                      <div className="flex items-center gap-1">
                        {msg.error ? (
                          // ERROR STATE: Chhota red exclamation ya retry icon
                          <span className="text-red-400 text-[10px] font-bold">
                            Failed
                          </span>
                        ) : msg.isSending ? (
                          // SENDING STATE: Chhota spinner ya clock
                          <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
                        ) : (
                          // SENT/READ STATE: Aapka purana tick logic
                          <span
                            className={
                              isRead
                                ? "text-blue-200"
                                : "text-primary-foreground/60"
                            }
                          >
                            {isRead ? (
                              <CheckCheck
                                size={14}
                                strokeWidth={3}
                                className="text-blue-400"
                              />
                            ) : (
                              <Check size={14} strokeWidth={3} />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isOtherUserTyping && (
          <div className="flex gap-3 max-w-[85%] items-end animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Samne wale ka avatar typing ke saath */}
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold border border-border shrink-0">
              {otherUser?.name?.[0]}
            </div>

            {/* Typing dots bubble */}
            <div className="bg-secondary/50 p-3.5 rounded-2xl rounded-bl-none border border-border/50 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
        {/* Typing Indicator Bubble */}
      </div>

      {/* Message input */}
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
