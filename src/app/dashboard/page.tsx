import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Settings, MessageSquare, LogOut, ArrowRight, Activity } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/"); // Or redirect to a login page
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isDiscordConnected = !!profile?.discord_token;

  // Fetch user rules
  const { data: rules } = await supabase
    .from("rules")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const activeRules = rules || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#5865F2] to-[#24292e] flex items-center justify-center">
              <span className="text-white text-sm">GB</span>
            </div>
            GitBridge
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard/logs" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
              Activity Logs
            </Link>
            <div className="text-sm text-gray-400 hidden sm:block">{user.email}</div>
            <form action="/auth/signout" method="post">
              <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Rules</h1>
            <p className="text-gray-400">Manage connections between GitHub and Discord.</p>
          </div>
          <Link href="/dashboard/new" className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            New Rule
          </Link>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Status Cards */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-gray-300">
              <GithubIcon className="w-5 h-5" />
              <h2 className="font-semibold">GitHub Connection</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Connected</span>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-gray-300">
              <MessageSquare className="w-5 h-5" />
              <h2 className="font-semibold">Discord Connection</h2>
            </div>
            {isDiscordConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <Link href="/api/discord/connect" className="text-sm font-medium text-yellow-500 hover:underline">
                  Click to Connect
                </Link>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-gray-300">
              <Settings className="w-5 h-5" />
              <h2 className="font-semibold">Active Rules</h2>
            </div>
            <div className="text-2xl font-bold">{activeRules.length}</div>
          </div>
        </div>

        {/* Rules List */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          {activeRules.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-lg font-medium text-white mb-2">No rules yet</p>
              <p className="mb-6">Create your first rule to start forwarding GitHub events to Discord.</p>
              <Link href="/dashboard/new" className="text-[#5865F2] hover:text-white font-medium hover:underline">
                Create a Rule &rarr;
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
               {activeRules.map((rule) => (
                 <div key={rule.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className={`font-bold text-lg ${rule.is_active === false ? "text-gray-500 line-through" : ""}`}>
                         {rule.github_repo_full_name}
                       </span>
                       <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-300 border border-white/10 uppercase tracking-wider">{rule.trigger_event}</span>
                       {rule.is_active === false && (
                         <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">PAUSED</span>
                       )}
                     </div>
                     <div className="text-gray-400 text-sm flex items-center gap-2">
                       <ArrowRight className="w-4 h-4" />
                       Discord: #{rule.discord_channel_name}
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <form action="/api/rules/toggle" method="POST">
                       <input type="hidden" name="rule_id" value={rule.id} />
                       <input type="hidden" name="is_active" value={rule.is_active !== false ? "true" : "false"} />
                       <button className={`text-sm font-medium px-3 py-1.5 rounded transition-colors ${rule.is_active !== false ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10" : "text-green-400 hover:text-green-300 hover:bg-green-400/10"}`}>
                         {rule.is_active !== false ? "Pause" : "Resume"}
                       </button>
                     </form>
                     <form action="/api/rules/delete" method="POST">
                       <input type="hidden" name="rule_id" value={rule.id} />
                       <button className="text-red-400 hover:text-red-300 text-sm font-medium hover:bg-red-400/10 px-3 py-1.5 rounded transition-colors">
                         Delete
                       </button>
                     </form>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
