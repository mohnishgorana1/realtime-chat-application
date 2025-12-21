"use client";

import * as React from "react";
// Ensure you are importing all necessary React hooks explicitly if not using the React. prefix
import { useRef, useState, useEffect, useCallback } from "react"; 

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

const ThemeToggle = () => {
  // HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL
  const { setTheme, theme, resolvedTheme } = useTheme();
  // We explicitly use useState and useEffect imports here:
  const [mounted, setMounted] = useState(false); 
  const buttonRef = useRef<HTMLButtonElement>(null); 

  useEffect(() => {
      setMounted(true);
      // Clean up the ref when unmounting, although usually not strictly necessary for simple refs
      return () => {
        // Any necessary cleanup
      };
  }, []);

  // Use resolvedTheme (light/dark) to determine the current state
  const isDark = resolvedTheme === "dark";

  // Use useCallback import here:
  const toggleThemeWithTransition = useCallback(async () => {
    const nextTheme = isDark ? "light" : "dark";

    // 1. Check if the browser supports View Transitions
    if (!document.startViewTransition || !buttonRef.current) {
      setTheme(nextTheme);
      return;
    }

    // 2. Start the View Transition
    await document.startViewTransition(() => {
      // 3. Synchronously update the DOM (theme state)
      flushSync(() => {
        setTheme(nextTheme);
      });
    }).ready;

    // --- Start Radial Reveal Animation ---

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    
    // Calculate the maximum distance from the button center to any corner of the viewport
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Apply the circle clip-path animation
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500, // Adjust duration as needed
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [isDark, setTheme]); // Added dependencies

  
  if (!mounted) {
    // Return a simple placeholder when not mounted
    return <div className="w-8 h-8" />; 
  }

  return (
    <button
      ref={buttonRef}
      onClick={toggleThemeWithTransition}
      className="p-0 rounded-lg transition-all duration-300 w-8 h-8 flex items-center justify-center
                   bg-gray-200 text-gray-700 hover:bg-gray-300 
                   dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      aria-label="Toggle theme"
    >
      <Moon 
        className={`h-5 w-5 absolute transition-all duration-500 ${
          isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        }`}
      />
      <Sun 
        className={`h-5 w-5 absolute transition-all duration-500 ${
          isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;