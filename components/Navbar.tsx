"use client";
import { motion, AnimatePresence } from "framer-motion";
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
    <nav className="sticky top-4 z-50 bg-background/80 backdrop-blur-xl px-4 py-2 mx-2 md:mx-4 rounded-3xl border border-border shadow-lg transition-all duration-300">
      {/* Container: Flexbox used for perfect 3-section alignment */}
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 relative">
        {/* LEFT SECTION: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="group flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95">
              <MessageSquare size={18} fill="currentColor" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden lg:block">
              ChatApp<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* CENTER SECTION: Navigation (Desktop Only) */}
        <div className="hidden md:flex items-center bg-secondary/40 p-1 rounded-2xl border border-border/50 backdrop-blur-md">
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
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* RIGHT SECTION: Actions */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
          <ThemeToggle />

          <SignedIn>
            <button className="hidden sm:block p-2 hover:bg-secondary rounded-xl transition-colors relative text-muted-foreground hover:text-foreground">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border border-background"></span>
            </button>
          </SignedIn>

          <Link
            href="https://github.com"
            className="hidden xs:block p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <BsGithub size={20} />
          </Link>

          <div className="flex items-center pl-2 border-l border-border/50 ml-1 gap-3">
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
              <div className="flex items-center gap-2">
                {appUser && !loading && (
                  <span className="hidden xl:block text-xs font-semibold text-muted-foreground truncate max-w-[100px]">
                    {appUser.name.split(" ")[0]}
                  </span>
                )}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox:
                        "h-9 w-9 rounded-xl border border-border shadow-sm",
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-popover/95 border-t border-border mt-2 rounded-2xl shadow-xl"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Icon size={18} className="text-primary" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
