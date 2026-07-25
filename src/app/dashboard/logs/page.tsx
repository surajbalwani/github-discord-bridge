import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function LogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch the latest 50 logs. We don't filter by user yet since webhook_logs doesn't have a user_id, 
  // but in a multi-tenant app we would join with rules table to filter by user's repos.
  // For this single-user tool, fetching all is fine.
  const { data: logs } = await supabase
    .from("webhook_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="font-bold text-xl flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#5865F2]" />
              Activity Logs
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Webhook Logs</h1>
          <p className="text-gray-400">See exactly what events GitHub is sending and whether they succeeded.</p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          {!logs || logs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-lg font-medium text-white mb-2">No activity yet</p>
              <p>When GitHub sends an event, it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {logs.map((log: any) => (
                <div key={log.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {log.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : log.status === "skipped" ? (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-bold capitalize text-lg">{log.event}</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-300">
                        Repo ID: {log.repo_id}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTime(log.created_at)}
                    </div>
                  </div>
                  
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-sm font-mono text-gray-300 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
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
