import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default async function EditRulePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const ruleId = resolvedParams.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch the rule to edit
  const { data: rule } = await supabase
    .from("rules")
    .select("*")
    .eq("id", ruleId)
    .eq("user_id", user.id)
    .single();

  if (!rule) {
    redirect("/dashboard");
  }

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
        <h1 className="text-3xl font-bold mb-2">Edit Rule</h1>
        <p className="text-gray-400 mb-8">Update the configuration for {rule.github_repo_full_name}.</p>

        <form action="/api/rules/update" method="POST" className="space-y-8 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-sm">
          <input type="hidden" name="rule_id" value={rule.id} />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Repository</label>
              <input 
                type="text" 
                disabled
                value={rule.github_repo_full_name}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Repository cannot be changed. Create a new rule instead.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="event" className="block text-sm font-medium text-gray-300">Trigger Event</label>
              <select 
                name="event" 
                id="event" 
                required
                defaultValue={rule.trigger_event}
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
                defaultValue={rule.branch_filter || ""}
                placeholder="e.g., main or production (leave empty for all)"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              />
              <p className="text-xs text-gray-500">Only applies to Push and Pull Request events.</p>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
              <h3 className="font-semibold text-[#5865F2]">Advanced Customization</h3>
              
              <div className="space-y-2">
                <label htmlFor="custom_template" className="block text-sm font-medium text-gray-300">Custom Discord Message (Optional)</label>
                <textarea 
                  name="custom_template" 
                  id="custom_template" 
                  defaultValue={rule.custom_template || ""}
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
                  defaultValue={rule.role_mention || ""}
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
                  defaultValue={rule.thread_id || ""}
                  placeholder="e.g., 123456789012345678"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                />
                <p className="text-xs text-gray-500">To send messages into a specific thread instead of the main channel.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-xl font-bold transition-colors">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
}
