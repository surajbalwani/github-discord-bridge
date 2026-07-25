import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings, UserX, LogOut } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="font-bold text-xl flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your connected accounts and data.</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4">Connections</h2>
            
            <div className="space-y-4 divide-y divide-white/10">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <div className="font-bold">GitHub Account</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {profile?.github_token ? "Connected and syncing repositories." : "Not connected."}
                  </div>
                </div>
                {profile?.github_token && (
                  <form action="/auth/signout" method="post">
                    <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium">
                      Disconnect
                    </button>
                  </form>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="font-bold text-[#5865F2]">Discord Account</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {profile?.discord_token ? "Connected and ready to send messages." : "Not connected."}
                  </div>
                </div>
                <form action="/api/discord/disconnect" method="post">
                  <button 
                    disabled={!profile?.discord_token}
                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            
            <div className="flex items-center justify-between border-t border-red-500/20 pt-6">
              <div>
                <div className="font-bold">Delete Account</div>
                <div className="text-sm text-gray-400">Permanently delete your account, rules, and logs.</div>
              </div>
              
              <form action="/api/auth/delete" method="post">
                <button 
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-bold flex items-center gap-2"
                  onClick={(e) => {
                    if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <UserX className="w-4 h-4" /> Delete Account
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
