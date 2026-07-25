import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { LoginButton } from "@/components/LoginButton";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#5865F2] rounded-full blur-[128px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#24292e] rounded-full blur-[128px] opacity-50 pointer-events-none" />

      <main className="z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 text-sm font-medium text-gray-300">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          Now in Open Beta
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          Connect GitHub Events to Discord
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Create powerful, free webhooks that instantly notify your Discord servers about commits, pull requests, and issues from your GitHub repositories.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {user ? (
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200 overflow-hidden backdrop-blur-md"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-[#5865F2]"></span>
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
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-300 bg-transparent border border-gray-700 rounded-xl hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <GithubIcon className="w-5 h-5 mr-2" />
            View Source
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <GithubIcon className="w-8 h-8 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">GitHub Native</h3>
            <p className="text-gray-400">Works with both personal and organization repositories seamlessly.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <MessageSquare className="w-8 h-8 text-[#5865F2] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Discord Webhooks</h3>
            <p className="text-gray-400">Directly post to any channel you own. No complex bots required.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400 font-bold">
              $0
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100% Free</h3>
            <p className="text-gray-400">Built to be completely free-to-host on Vercel and Supabase.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
