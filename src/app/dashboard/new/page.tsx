import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import RuleForm from "@/components/RuleForm";

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

        <RuleForm repos={repos} actionUrl="/api/rules/create" submitText="Continue to Discord" />
      </main>
    </div>
  );
}
