import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default async function NewRulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("github_token")
    .eq("id", user.id)
    .single();

  if (!profile?.github_token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">GitHub Token Missing</h2>
          <p className="text-gray-400 mb-6">We need your permission to list your repositories. Please log out and log back in to grant this permission.</p>
          <form action="/auth/signout" method="post">
            <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-xl font-bold w-full transition-colors">
              Log Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Fetch repositories from GitHub
  const repoRes = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: {
      Authorization: `Bearer ${profile.github_token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!repoRes.ok) {
    // If token is invalid or expired
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">GitHub API Error</h2>
          <p className="text-gray-400 mb-6">Could not fetch your repositories. Your session might have expired.</p>
          <form action="/auth/signout" method="post">
            <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-xl font-bold w-full transition-colors">
              Log Out and Reconnect
            </button>
          </form>
        </div>
      </div>
    );
  }

  const repos = await repoRes.json();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Create a New Rule</h1>
        <p className="text-gray-400 mb-8">Connect a GitHub repository event to a Discord channel.</p>

        <form action="/api/rules/create" method="POST" className="space-y-8 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-sm">
          {/* Step 1: GitHub Source */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b border-white/10 pb-2">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
              GitHub Source
            </div>
            
            <div className="space-y-2">
              <label htmlFor="repo" className="block text-sm font-medium text-gray-300">Repository</label>
              <select 
                name="repo" 
                id="repo" 
                required
                defaultValue=""
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              >
                <option value="" disabled>Select a repository...</option>
                {repos.map((r: any) => (
                  <option key={r.id} value={`${r.id}|${r.full_name}`}>
                    {r.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="event" className="block text-sm font-medium text-gray-300">Trigger Event</label>
              <select 
                name="event" 
                id="event" 
                required
                defaultValue="push"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              >
                <option value="push">Push (Commits)</option>
                <option value="pull_request">Pull Requests</option>
                <option value="issues">Issues</option>
                <option value="star">Stars</option>
                <option value="workflow_run">GitHub Actions (CI/CD)</option>
                <option value="release">Releases</option>
                <option value="*">Everything (All Events)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="branch_filter" className="block text-sm font-medium text-gray-300">Branch Filter (Optional)</label>
              <input 
                type="text" 
                name="branch_filter" 
                id="branch_filter" 
                placeholder="e.g., main or production (leave empty for all)"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              />
              <p className="text-xs text-gray-500">Only applies to Push and Pull Request events.</p>
            </div>

            {/* Phase 3 Customizations */}
            <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
              <h3 className="font-semibold text-[#5865F2]">Advanced Customization</h3>
              
              <div className="space-y-2">
                <label htmlFor="custom_template" className="block text-sm font-medium text-gray-300">Custom Discord Message (Optional)</label>
                <textarea 
                  name="custom_template" 
                  id="custom_template" 
                  placeholder="e.g., Alert: {{author}} pushed to {{branch}} in {{repo_name}}"
                  rows={2}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                ></textarea>
                <p className="text-xs text-gray-500">Use {'{{author}}, {{repo_name}}, {{branch}}, {{message}}, {{url}}'} to customize the text.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="role_mention" className="block text-sm font-medium text-gray-300">Discord Role Mention (Optional)</label>
                <input 
                  type="text" 
                  name="role_mention" 
                  id="role_mention" 
                  placeholder="e.g., <@&123456789> or @everyone"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="thread_id" className="block text-sm font-medium text-gray-300">Discord Thread ID (Optional)</label>
                <input 
                  type="text" 
                  name="thread_id" 
                  id="thread_id" 
                  placeholder="e.g., 123456789012345678"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                />
                <p className="text-xs text-gray-500">To send messages into a specific thread instead of the main channel.</p>
              </div>
            </div>
          </div>

          {/* Step 2: Discord Destination */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b border-white/10 pb-2">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
              Discord Destination
            </div>
            <p className="text-sm text-gray-400">
              When you click the button below, you will be redirected to Discord to select which Server and Channel you want to send the notifications to.
            </p>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-xl font-bold transition-colors">
            <MessageSquare className="w-5 h-5" />
            Continue to Discord
          </button>
        </form>
      </main>
    </div>
  );
}
