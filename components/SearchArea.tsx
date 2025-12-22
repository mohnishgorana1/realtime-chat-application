"use client";
import React, { useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAppUser } from "@/context/UserContext";

export default function SearchArea({
  onSelectUser,
}: {
  onSelectUser: (user: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { appUser } = useAppUser();

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) return setResults([]);

    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${val}`);
      const data = await res.json();
      if (data.success) setResults(data.users);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async (userId: string) => {
    console.log("createing chat");
    
    try {
      const response = await axios.post(`/api/chats/create`, {
        appUser: appUser?._id,
        otherUser: userId,
      });

      if (response.data.success) {
        onSelectUser(response.data.chat);
        setQuery(""); // Clear search after selection
      }
    } catch (error) {
      console.error("Error creating chat", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-4 border-b border-border space-y-4 group">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Find new people..."
          className="w-full bg-secondary/50 border border-transparent rounded-2xl py-2 pl-10 pr-4 text-sm focus:bg-background focus:border-primary transition-all outline-none"
        />
      </div>

      <AnimatePresence>
        {query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-12 left-4 right-4 mt-2 bg-popover border-border border-2 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {loading ? (
              <div className="p-4 text-center text-xs">Searching...</div>
            ) : results.length > 0 ? (
              results.map((u: any) => (
                <div
                  key={u._id}
                  onClick={() => createNewChat(u._id)}
                  className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                    {u.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{u.name}</span>
                  </div>
                  <button className="ml-auto cursor-pointer">
                    <PlusCircle />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No users found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
