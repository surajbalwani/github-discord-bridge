import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RuleForm from "@/components/RuleForm";

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

        <RuleForm rule={rule} actionUrl="/api/rules/update" submitText="Save Changes" />
      </main>
    </div>
  );
}
