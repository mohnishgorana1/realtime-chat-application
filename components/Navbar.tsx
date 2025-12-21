"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Users, Settings, Menu, X, Bell, LogIn } from "lucide-react";
import { BsGithub } from "react-icons/bs";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs"; // Clerk Components
import { useAppUser } from "@/context/UserContext"; // Aapka Custom Context

const navItems = [
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const { appUser, loading } = useAppUser(); // MongoDB data access

  return (
    <nav className="sticky top-4 z-50 bg-zinc-900/80 backdrop-blur-xl px-4 py-2 mx-4 rounded-3xl border border-zinc-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-14">
        
        {/* Logo Section */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <MessageSquare size={18} fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
            ChatApp<span className="text-blue-500">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center bg-zinc-800/50 p-1 rounded-2xl border border-zinc-700/50">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                className="relative px-5 py-2 text-sm font-medium transition-colors text-zinc-400 hover:text-white flex items-center gap-2"
              >
                {hovered === idx && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 bg-zinc-700/50 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Notifications (Only if signed in) */}
          <SignedIn>
            <button className="p-2 hover:bg-zinc-800 rounded-xl transition-colors relative text-zinc-400">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-zinc-900"></span>
            </button>
          </SignedIn>

          {/* GitHub Icon */}
          <Link 
            href="https://github.com" 
            className="hidden xs:block p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400"
          >
            <BsGithub size={20} />
          </Link>

          {/* CLERK AUTH BUTTONS */}
          <div className="flex items-center pl-2 border-l border-zinc-800 ml-1">
            <SignedOut>
              {/* Sign In Button */}
              <Link 
                href="/sign-in" 
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            </SignedOut>

            <SignedIn>
              {/* User Profile / User Button */}
              <div className="flex items-center gap-3">
                {/* Agar MongoDB se user mil gaya hai to name dikhao */}
                {appUser && !loading && (
                  <span className="hidden lg:block text-xs font-medium text-zinc-400">
                    {appUser.name}
                  </span>
                )}
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9 rounded-xl border border-zinc-700",
                      userButtonPopoverCard: "bg-zinc-900 border border-zinc-800 text-white",
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-2 shadow-2xl"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl hover:bg-zinc-800 transition-colors text-zinc-300"
              >
                <Icon size={20} className="text-blue-500" />
                <span className="font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;