"use client";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
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
  Loader2, // Icon for loading spinner
} from "lucide-react";
import { useAppUser } from "@/context/UserContext";
import Image from "next/image";
import axios from "axios";
import { pusherClient } from "@/lib/pusherClient";

// ... [ChatHeader component remains exactly the same] ...
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

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null); // For auto-scroll bottom
  const containerRef = useRef<HTMLDivElement>(null); // For scroll position calculation

  // To preserve scroll position
  const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);

  // typing indicators
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const otherUser = activeChat?.participants?.find(
    (p: any) => p._id !== appUser?._id
  );
  const isOnline = onlineUsers.includes(otherUser?._id);

  // --- Reset State when Chat Changes ---
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setPrevScrollHeight(null);
  }, [activeChat?._id]);

  // --- 1. Fetch Messages (Handles both Initial and Pagination) ---
  const fetchMessages = async (currentPage: number, isLoadMore = false) => {
    if (!activeChat?._id) return;

    if (isLoadMore) setLoadingMore(true);
    else setInitialLoading(true);

    try {
      const res = await axios.get(
        `/api/messages/${activeChat._id}?page=${currentPage}&limit=10`
      );

      if (res.data.success) {
        const fetchedMessages = res.data.data;
        const serverHasMore = res.data.pagination.hasMore;

        setHasMore(serverHasMore);

        if (isLoadMore) {
          // PAGINATION: Purane messages ko upar append karo
          setMessages((prev) => [...fetchedMessages, ...prev]);
        } else {
          // INITIAL LOAD: Set messages directly
          setMessages(fetchedMessages);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setInitialLoading(false);
    }
  };

  // --- Initial Load Trigger ---
  useEffect(() => {
    if (activeChat?._id) {
      fetchMessages(1, false);
    }
  }, [activeChat?._id]);

  // --- Handle Scroll (Load More Logic) ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;

    // Agar user top par pohunch gaya (scrollTop === 0) aur messages bache hain
    if (scrollTop === 0 && hasMore && !loadingMore && !initialLoading) {
      // Current scroll height save kar lo taki jump na ho
      setPrevScrollHeight(scrollHeight);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  };

  // --- Scroll Retention Logic (Crucial for "Niche se upar na bhage") ---
  useLayoutEffect(() => {
    // Sirf tab chalao jab humne 'Load More' kiya ho (prevScrollHeight exist karta ho)
    if (prevScrollHeight && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeight;

      // User ko wahi position par rakho jaha wo tha
      containerRef.current.scrollTop = heightDifference;

      // Reset ref
      setPrevScrollHeight(null);
    } else if (
      !prevScrollHeight &&
      !loadingMore &&
      !initialLoading &&
      messages.length > 0 &&
      page === 1
    ) {
      // Only scroll to bottom on INITIAL load or new message sent, not on pagination
      scrollRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, loadingMore, initialLoading]);
  // Dependency explanation: Jab messages update honge, UI re-render hoga, tab hum scroll adjust karenge.

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat?._id || !appUser?._id) return;

    const contentToSend = newMessage;
    setNewMessage("");

    // Reset pagination logic slightly to ensure flow works?
    // Usually sending a message implies we are at the bottom.

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
    // Force scroll bottom on send
    setTimeout(
      () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
      10
    );

    try {
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

  // --- Read Status API Call ---
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

  // --- Pusher Setup (Same as before) ---
  useEffect(() => {
    if (!activeChat?._id || !appUser?._id) return;
    const channelName = `private-chat-${activeChat._id}`;
    const channel = pusherClient.subscribe(channelName);

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
      // New msg aane par niche scroll karo
      setTimeout(
        () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    });

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

    channel.bind("client-typing", (data: { userId: string }) => {
      if (data.userId !== appUser._id) setIsOtherUserTyping(true);
    });

    channel.bind("client-stop-typing", (data: { userId: string }) => {
      if (data.userId !== appUser._id) setIsOtherUserTyping(false);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [activeChat?._id, appUser?._id]);

  // Typing Trigger Logic
  useEffect(() => {
    if (!activeChat?._id || !appUser?._id || !newMessage) return;
    const channelName = `private-chat-${activeChat._id}`;
    const channel = pusherClient.subscribe(channelName);

    if (newMessage.length > 0) {
      channel.trigger("client-typing", { userId: appUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        channel.trigger("client-stop-typing", { userId: appUser._id });
      }, 2000);
    }
  }, [newMessage]);

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
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30 dark:bg-zinc-950/30 custom-scrollbar"
      >
        {/* Loading More Spinner (Top) */}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="animate-spin text-primary/50" size={20} />
          </div>
        )}

        {initialLoading ? (
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
                          <span className="text-red-400 text-[10px] font-bold">
                            Failed
                          </span>
                        ) : msg.isSending ? (
                          <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
                        ) : (
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

        {/* Typing Indicator */}
        {isOtherUserTyping && (
          <div className="flex gap-3 max-w-[85%] items-end animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold border border-border shrink-0">
              {otherUser?.name?.[0]}
            </div>
            <div className="bg-secondary/50 p-3.5 rounded-2xl rounded-bl-none border border-border/50 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        {/* Invisible div for Auto Scroll Bottom */}
        <div ref={scrollRef} />
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
