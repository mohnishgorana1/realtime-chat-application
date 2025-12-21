"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Settings,
  Menu,
  X,
  Bell,
  LogIn,
} from "lucide-react";
import { BsGithub } from "react-icons/bs";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useAppUser } from "@/context/UserContext";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const { appUser, loading } = useAppUser();

  return (
    <nav className="sticky top-4 z-50 bg-background/80 backdrop-blur-xl px-4 py-2 mx-4 rounded-3xl border border-border shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-14">
        
        {/* Logo Section */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <MessageSquare size={18} fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
            ChatApp<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center bg-secondary/50 p-1 rounded-2xl border border-border/50">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                className="relative px-5 py-2 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                {hovered === idx && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 bg-accent rounded-xl"
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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="mr-1">
            <ThemeToggle />
          </div>

          <SignedIn>
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors relative text-muted-foreground hover:text-foreground">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
          </SignedIn>

          <Link
            href="https://github.com"
            className="hidden xs:block p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <BsGithub size={20} />
          </Link>

          {/* CLERK AUTH BUTTONS */}
          <div className="flex items-center pl-2 border-l border-border ml-1">
            <SignedOut>
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/10"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                {appUser && !loading && (
                  <span className="hidden lg:block text-xs font-medium text-muted-foreground">
                    {appUser.name}
                  </span>
                )}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9 rounded-xl border border-border overflow-hidden",
                      userButtonPopoverCard: "bg-popover border border-border text-popover-foreground",
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Animated) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 w-full bg-popover border border-border rounded-3xl p-4 space-y-2 shadow-2xl mx-4"
          style={{ width: 'calc(100% - 32px)' }} // Adjust for margins
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl hover:bg-accent transition-colors text-foreground"
              >
                <Icon size={20} className="text-primary" />
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