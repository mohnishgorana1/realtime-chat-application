"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Construction, ArrowLeft, Rocket } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full text-center space-y-8"
      >
        {/* Animated Icon Wrapper */}
        <div className="relative mx-auto w-24 h-24">
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full bg-secondary rounded-3xl flex items-center justify-center border border-border shadow-2xl"
          >
            <Construction className="w-12 h-12 text-primary" />
          </motion.div>
          
          {/* Floating Rocket Icon */}
          <motion.div 
            animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 bg-background p-2 rounded-full border border-border shadow-sm"
          >
             <Rocket size={20} className="text-orange-500" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground"
          >
            {title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            {description}
          </motion.p>
        </div>

        {/* Progress Bar Simulation */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full h-2 bg-secondary rounded-full overflow-hidden"
        >
            <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-primary/50 rounded-full"
            />
        </motion.div>

        <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
        >
            <Link href="/">
            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all flex items-center gap-2 mx-auto cursor-pointer shadow-lg shadow-primary/20">
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>
            </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}