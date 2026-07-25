"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Save, Zap, Loader2, CheckCircle2 } from "lucide-react";

type RuleFormProps = {
  repos?: { id: string; full_name: string }[]; // For new
  rule?: any; // For edit
  actionUrl: string;
  submitText: string;
};

export default function RuleForm({ repos, rule, actionUrl, submitText }: RuleFormProps) {
  const [event, setEvent] = useState(rule?.trigger_event || "push");
  const [repo, setRepo] = useState(rule ? `${rule.github_repo_id}|${rule.github_repo_full_name}` : "");
  const [template, setTemplate] = useState(rule?.custom_template || "");
  const [caughtEvent, setCaughtEvent] = useState<any>(null);
  const [isCatching, setIsCatching] = useState(false);

  // Determine available variables and default template based on event
  const getEventDetails = (e: string) => {
    switch(e) {
      case "push": return { vars: "{{author}}, {{repo_name}}, {{branch}}, {{message}}, {{url}}", default: "🔔 New **push** event in **{{repo_name}}** triggered by `{{author}}`." };
      case "pull_request": return { vars: "{{author}}, {{repo_name}}, {{branch}}, {{message}}, {{url}}, {{action}}", default: "🔔 New **pull_request** event in **{{repo_name}}** triggered by `{{author}}`." };
      case "issues": return { vars: "{{author}}, {{repo_name}}, {{message}}, {{url}}, {{action}}", default: "🔔 New **issues** event in **{{repo_name}}** triggered by `{{author}}`." };
      case "star": return { vars: "{{author}}, {{repo_name}}", default: "⭐ **{{author}}** starred **{{repo_name}}**!" };
      case "workflow_run": return { vars: "{{author}}, {{repo_name}}, {{branch}}, {{message}}, {{url}}, {{status}}", default: "⏳ Action **Workflow** status in **{{repo_name}}**\n[View Run]({{url}})" };
      case "release": return { vars: "{{author}}, {{repo_name}}, {{message}}, {{url}}, {{action}}", default: "🚀 Release **action**: **{{message}}** in **{{repo_name}}** by `{{author}}`\n[View Release]({{url}})" };
      default: return { vars: "{{author}}, {{repo_name}}, {{branch}}, {{message}}, {{url}}, {{action}}, {{status}}", default: "🔔 New event in **{{repo_name}}**." };
    }
  };

  const details = getEventDetails(event);

  const catchEvent = async () => {
    if (!repo) return alert("Please select a repository first");
    setIsCatching(true);
    setCaughtEvent(null);
    
    const [repoId] = repo.split("|");
    const startTime = Date.now();
    
    // Poll for 30 seconds
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 15) {
        clearInterval(interval);
        setIsCatching(false);
        alert("Timed out waiting for an event. Make sure you trigger the event in GitHub while it is listening!");
        return;
      }
      try {
        const res = await fetch(`/api/logs/latest?repo_id=${repoId}&event=${event}&since=${startTime}`);
        if (res.ok) {
          const data = await res.json();
          if (data.log) {
            setCaughtEvent(data.log);
            setIsCatching(false);
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);
  };

  return (
    <form action={actionUrl} method="POST" className="space-y-8 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-sm">
      {rule && <input type="hidden" name="rule_id" value={rule.id} />}
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold border-b border-white/10 pb-2">
          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
          GitHub Source
        </div>
        
        <div className="space-y-2">
          <label htmlFor="repo" className="block text-sm font-medium text-gray-300">Repository</label>
          {rule ? (
            <>
              <input 
                type="text" 
                disabled
                value={rule.github_repo_full_name}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <input type="hidden" name="repo" value={repo} />
              <p className="text-xs text-gray-500">Repository cannot be changed. Create a new rule instead.</p>
            </>
          ) : (
            <select 
              name="repo" 
              id="repo" 
              required
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            >
              <option value="" disabled>Select a repository...</option>
              {repos?.map((r: any) => (
                <option key={r.id} value={`${r.id}|${r.full_name}`}>
                  {r.full_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="event" className="block text-sm font-medium text-gray-300">Trigger Event</label>
          <select 
            name="event" 
            id="event" 
            required
            value={event}
            onChange={(e) => setEvent(e.target.value)}
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
            defaultValue={rule?.branch_filter || ""}
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
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder={`e.g., ${details.default}`}
              rows={2}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            ></textarea>
            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-2">
              <p className="text-xs text-gray-400 font-mono bg-black/30 p-2 rounded border border-white/5">
                <span className="text-gray-500 mr-1">Available variables:</span>
                {details.vars}
              </p>
            </div>
            
            {/* Real-time Preview Area */}
            <div className="mt-4 p-4 rounded-xl border border-white/5 bg-[#313338] shadow-inner text-sm">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Discord Message Preview</span>
              <div className="text-gray-200 whitespace-pre-wrap font-sans">
                {template || <span className="opacity-70">{details.default}</span>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="role_mention" className="block text-sm font-medium text-gray-300">Discord Role Mention (Optional)</label>
            <input 
              type="text" 
              name="role_mention" 
              id="role_mention" 
              defaultValue={rule?.role_mention || ""}
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
              defaultValue={rule?.thread_id || ""}
              placeholder="e.g., 123456789012345678"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            />
            <p className="text-xs text-gray-500">To send messages into a specific thread instead of the main channel.</p>
          </div>
        </div>

        {/* Zapier-style Event Catcher */}
        <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-500 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Live Event Catcher (Test Trigger)
              </h3>
              <p className="text-xs text-gray-400 mt-1">Want to see what data GitHub actually sends? Catch a live event!</p>
            </div>
            <button 
              type="button"
              onClick={catchEvent}
              disabled={isCatching}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${isCatching ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              {isCatching ? <><Loader2 className="w-4 h-4 animate-spin" /> Listening (trigger in GitHub)...</> : 'Test Trigger'}
            </button>
          </div>

          {caughtEvent && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                <CheckCircle2 className="w-4 h-4" /> Event successfully caught!
              </div>
              <div className="max-h-64 overflow-y-auto bg-black/50 p-4 rounded border border-white/10 font-mono text-xs text-green-300">
                <pre>{JSON.stringify(caughtEvent.payload, null, 2)}</pre>
              </div>
              <p className="text-xs text-gray-400 mt-2">You can use any of the nested JSON keys as variables if you modify the backend logic, but stick to the `Available variables` above for now.</p>
            </div>
          )}
        </div>
      </div>

      {!rule && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-lg font-semibold border-b border-white/10 pb-2">
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
            Discord Destination
          </div>
          <p className="text-sm text-gray-400">
            When you click the button below, you will be redirected to Discord to select which Server and Channel you want to send the notifications to.
          </p>
        </div>
      )}

      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-xl font-bold transition-colors">
        {rule ? <Save className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        {submitText}
      </button>
    </form>
  );
}
