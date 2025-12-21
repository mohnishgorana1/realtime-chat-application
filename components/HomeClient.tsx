"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  Users,
  Github,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import { useAppUser } from "@/context/UserContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomeClient() {
  const { appUser, loading } = useAppUser();

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden bg-background">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 md:pt-32 px-4 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-200 bg-primary/15 blur-[120px] rounded-full opacity-50 pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          {/* Status Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {appUser
              ? `Welcome back, ${appUser.name.split(" ")[0]}`
              : "v0.1.0 is now live"}
          </motion.div>

          {/* Dynamic Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
          >
            {appUser ? "Ready to rejoin the" : "Connect Instantly."} <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-neutral-900 via-neutral-600 to-neutral-400 dark:from-white dark:via-neutral-300 dark:to-neutral-500">
              {appUser ? "Conversation?" : "Chat Seamlessly."}
            </span>
          </motion.h1>

          {/* Dynamic Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {appUser
              ? "Your messages and groups are waiting for you. Dive back into your workspace and stay connected with your team."
              : "Experience the next generation of realtime communication. Secure groups, instant delivery, and a clean interface built for speed."}
          </motion.p>

          {/* Dynamic Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {appUser ? (
              <Link href="/messages" className="w-full sm:w-auto">
                <button className="w-full px-8 py-3 cursor-pointer bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
                  Open Dashboard <LayoutDashboard size={18} />
                </button>
              </Link>
            ) : (
              <Link href="/sign-in" className="w-full sm:w-auto">
                <button className="w-full px-8 py-3 cursor-pointer bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
                  Get Started <ArrowRight size={18} />
                </button>
              </Link>
            )}

            <Link href="https://github.com" className="w-full sm:w-auto">
              <button className="w-full px-8 py-3 cursor-pointer bg-secondary text-foreground font-medium rounded-xl border border-border hover:bg-accent transition-all flex items-center justify-center gap-2">
                <Github size={18} /> Star on GitHub
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- FEATURES SECTION --- (Common for both) */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary dark:group-hover:bg-zinc-200 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- CONDITIONAL CTA SECTION --- */}
      <AnimatePresence>
        {!appUser && (
          <section className="px-4 mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

                <MessageCircle
                  size={48}
                  className="mx-auto mb-6 text-white/80 relative z-10"
                />
                <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
                  Ready to start chatting?
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto relative z-10">
                  Join thousands of users communicating effortlessly. No credit
                  card required, just sign in and chat.
                </p>
                <Link href="/sign-in" className="relative z-10">
                  <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-zinc-100 transition-colors shadow-xl active:scale-95">
                    Create Free Account
                  </button>
                </Link>
              </div>
            </motion.div>
          </section>
        )}
      </AnimatePresence>

      <section className="px-4 py-10 bg-secondary/20 rounded-[3rem] mx-4 border border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Getting started is easy
            </h2>
            <p className="text-muted-foreground mt-4">
              Three simple steps to start your journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-12 z-0" />

            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up via Clerk with just one click using Google or Github.",
              },
              {
                step: "02",
                title: "Join Groups",
                desc: "Discover public channels or create your own private space.",
              },
              {
                step: "03",
                title: "Start Chatting",
                desc: "Send messages, share files, and connect in real-time.",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-black mx-auto shadow-xl shadow-primary/20">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
                <p className="text-muted-foreground text-sm px-4">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                What our{" "}
                <span className="text-primary font-serif italic">users</span>{" "}
                say about us
              </h2>
              <p className="text-muted-foreground text-lg">
                Join 10,000+ developers and teams who communicate through our
                platform daily.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                {
                  name: "Alex Rivera",
                  role: "UI Designer",
                  text: "The interface is so clean. It's the first chat app that doesn't feel cluttered.",
                },
                {
                  name: "Sarah Chen",
                  role: "Fullstack Dev",
                  text: "Latency is almost non-existent. The WebSocket implementation is rock solid.",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 10 }}
                  className="p-6 bg-card border border-border rounded-2xl shadow-sm"
                >
                  <p className="italic text-foreground/80 font-medium text-sm">
                    "{t.text}"
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-tr from-primary to-purple-500 rounded-full" />
                    <div>
                      <h4 className="font-bold text-sm">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER SECTION --- */}
      <footer className="px-4 mt-10">
        <div className="max-w-6xl mx-auto border-t border-border pt-12 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <MessageCircle size={18} fill="currentColor" />
                </div>
                <span className="font-bold text-xl">
                  ChatApp<span className="text-primary">.</span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Making real-time communication simple, secure, and accessible
                for everyone, everywhere.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Features
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  API
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Pricing
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">
                  About Us
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Privacy
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Terms
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border/50 text-xs text-muted-foreground font-medium">
            <p>© 2025 ChatApp Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="https://github.com" className="hover:text-foreground">
                Github
              </Link>
              <Link href="#" className="hover:text-foreground">
                Twitter
              </Link>
              <Link href="#" className="hover:text-foreground">
                Discord
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Real-time Messaging",
    desc: "Experience zero latency. Messages are delivered instantly via WebSockets, ensuring smooth conversation flow.",
    icon: Zap,
  },
  {
    title: "Secure Groups",
    desc: "Create private groups for your team or friends. Manage permissions and keep your conversations focused.",
    icon: Users,
  },
  {
    title: "Enterprise Security",
    desc: "Your data is safe with us. End-to-end encryption ensures that your private conversations stay private.",
    icon: Shield,
  },
];
