"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { pusherClient } from "@/lib/pusherClient";

interface AppUser {
  _id: string;
  clerkUserId: string;
  name: string;
  email: string;
  phone?: string;
  dob: Date;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserContextType {
  appUser: AppUser | null;
  loading: boolean;
  refreshUser: (isInitialLoad?: boolean) => Promise<void>;
  onlineUsers: string[];
}

// ------------------ Context ------------------

const UserContext = createContext<UserContextType>({
  appUser: null,
  loading: true,
  refreshUser: async () => {},
  onlineUsers: [],
});

// ------------------ Provider ------------------

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const refreshUser = async (isInitialLoad = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!isInitialLoad) setLoading(true);

    try {
      const res = await axios.get(`/api/users/me?clerkUserId=${user.id}`);
      if (res.data.success) {
        const fetchedUser: AppUser = res.data.data;
        setAppUser(fetchedUser);
        localStorage.setItem("appUser", JSON.stringify(fetchedUser));
      }
    } catch (err) {
      console.error("❌ Failed to refresh user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!appUser?._id) return;

    // 1. Subscribe to Presence Channel
    const channelName = "presence-online";
    const channel = pusherClient.subscribe(channelName);

    // 2. Initial list (Jab aap subscribe karte ho)
    channel.bind("pusher:subscription_succeeded", (members: any) => {
      const initialIds: string[] = [];
      members.each((member: any) => initialIds.push(member.id));
      setOnlineUsers(initialIds);
    });

    // 3. User comes online
    channel.bind("pusher:member_added", (member: any) => {
      setOnlineUsers((prev) => [...new Set([...prev, member.id])]);
    });

    // 4. User goes offline
    channel.bind("pusher:member_removed", (member: any) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== member.id));
    });

    return () => {
      pusherClient.unsubscribe(channelName);
      channel.unbind_all();
    };
  }, [appUser?._id]);



  // -------------------------------------

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      const cachedUserString = localStorage.getItem("appUser");
      let hasCachedData = false;

      if (cachedUserString) {
        try {
          const cachedUser: AppUser = JSON.parse(cachedUserString);
          setAppUser(cachedUser);
          setLoading(false);
          hasCachedData = true;
        } catch (e) {
          console.error("⚠️ Error parsing cached user data:", e);
          localStorage.removeItem("appUser");
        }
      }

      refreshUser(!hasCachedData); // Fetch fresh data if no cache
    } else {
      setAppUser(null);
      localStorage.removeItem("appUser");
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  return (
    <UserContext.Provider value={{ appUser, loading, refreshUser, onlineUsers }}>
      {children}
    </UserContext.Provider>
  );
};

// ------------------ Hook ------------------

export const useAppUser = () => useContext(UserContext);
