"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Zap, Shield, GitCommit, Activity } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { motion, Variants } from "framer-motion";
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export function LandingContent({ user }: { user: any }) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
      {/* Dynamic Animated Background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-[#5865F2] rounded-full blur-[128px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-900 rounded-full blur-[128px] pointer-events-none" 
      />

      <main className="z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-12 text-sm font-medium text-gray-300 shadow-xl"
        >
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          Now in Open Beta v2.0
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white leading-tight"
        >
          Bridge <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">GitHub</span> directly<br />to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5865F2] to-indigo-400">Discord</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-400 mb-12 max-w-3xl leading-relaxed"
        >
          Create powerful, free webhooks that instantly notify your team about commits, pull requests, CI/CD pipelines, and issues. Zero coding required.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-24"
        >
          {user ? (
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-[#5865F2] border border-[#4752C4] rounded-xl hover:bg-[#4752C4] transition-all duration-300 shadow-[0_0_40px_rgba(88,101,242,0.4)] hover:shadow-[0_0_60px_rgba(88,101,242,0.6)] hover:-translate-y-1"
            >
              <span className="relative flex items-center gap-2">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ) : (
            <LoginButton />
          )}
          
          <Link
            href="https://github.com"
            target="_blank"
            className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-300 backdrop-blur-sm hover:-translate-y-1"
          >
            <GithubIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            View Source
          </Link>
        </motion.div>

        {/* Feature grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left w-full"
        >
          <motion.div variants={item} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 hover:border-white/20 hover:-translate-y-2 group">
            <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GithubIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">GitHub Native</h3>
            <p className="text-gray-400 leading-relaxed">Works perfectly with personal repositories and organization accounts out of the box.</p>
          </motion.div>

          <motion.div variants={item} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 hover:border-[#5865F2]/50 hover:-translate-y-2 group">
            <div className="w-12 h-12 rounded-xl bg-[#5865F2]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-[#5865F2]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Discord Integration</h3>
            <p className="text-gray-400 leading-relaxed">Post directly to any channel or thread. Ping roles, customize templates, and more.</p>
          </motion.div>

          <motion.div variants={item} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 hover:border-yellow-500/50 hover:-translate-y-2 group">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Catcher</h3>
            <p className="text-gray-400 leading-relaxed">Zapier-style live event testing. Catch webhooks in real-time as you build your rules.</p>
          </motion.div>

          <motion.div variants={item} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-2 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Branch Filters</h3>
            <p className="text-gray-400 leading-relaxed">Only care about `main`? Filter pushes and pull requests by branch easily.</p>
          </motion.div>

          <motion.div variants={item} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 hover:border-red-500/50 hover:-translate-y-2 group">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">CI/CD & Actions</h3>
            <p className="text-gray-400 leading-relaxed">Track GitHub Actions workflow runs, deployments, and releases instantly.</p>
          </motion.div>

          <motion.div variants={item} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 hover:border-green-500/50 hover:-translate-y-2 group">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400 font-bold group-hover:scale-110 transition-transform">
              $0
            </div>
            <h3 className="text-xl font-bold text-white mb-3">100% Free</h3>
            <p className="text-gray-400 leading-relaxed">Built to be completely free-to-host using Vercel and Supabase's free tiers.</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
