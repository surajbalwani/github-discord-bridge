import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We create a standard Supabase client (without cookies) because GitHub requests have no user session.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const event = request.headers.get("x-github-event");
    const payload = await request.json();

    if (event === "ping") {
      return NextResponse.json({ message: "pong" });
    }

    if (!payload.repository?.id) {
      return NextResponse.json({ error: "Missing repository ID" }, { status: 400 });
    }

    const repoId = String(payload.repository.id);

    // Call our secure database function to bypass RLS and get matching rules
    const { data: rules, error } = await supabase.rpc("get_webhooks_for_repo", {
      repo_id: repoId,
    });

    if (error || !rules || rules.length === 0) {
      console.log("No rules found for repo", repoId, error);
      await supabase.from("webhook_logs").insert({
        event: event,
        repo_id: repoId,
        status: "skipped",
        details: { message: "No rules found or RPC error", error }
      });
      return NextResponse.json({ message: "No active rules for this repository." });
    }

    const repoName = payload.repository.full_name;
    const sender = payload.sender?.login;
    let messageContent = "";

    // Format the Discord message based on the event type
    switch (event) {
      case "push":
        const commits = payload.commits?.length || 0;
        const branch = payload.ref?.split("/").pop() || "unknown branch";
        messageContent = `📦 **${commits} new commit(s)** pushed to \`${branch}\` in **${repoName}** by \`${sender}\`.\n\n${payload.head_commit?.message ? `> ${payload.head_commit.message}` : ""}\n[View Changes](${payload.compare})`;
        break;
      case "pull_request":
        const prAction = payload.action;
        messageContent = `🔀 Pull Request **${prAction}** in **${repoName}** by \`${sender}\`\n**${payload.pull_request.title}**\n[View PR](${payload.pull_request.html_url})`;
        break;
      case "issues":
        const issueAction = payload.action;
        messageContent = `⚠️ Issue **${issueAction}** in **${repoName}** by \`${sender}\`\n**${payload.issue.title}**\n[View Issue](${payload.issue.html_url})`;
        break;
      case "star":
        if (payload.action === "created") {
          messageContent = `⭐ **${sender}** starred **${repoName}**!`;
        } else {
          return NextResponse.json({ message: "Ignored unstar" });
        }
        break;
      default:
        messageContent = `🔔 New **${event}** event in **${repoName}** triggered by \`${sender}\`.`;
    }

    // Send the message to all matching Discord webhooks
    for (const rule of rules) {
      // Check if rule applies to this event
      if (rule.trigger_event === "*" || rule.trigger_event === event) {
        
        // Apply branch filter if set
        if (rule.branch_filter) {
          if (event === "push") {
            const branch = payload.ref?.split("/").pop();
            if (branch !== rule.branch_filter) continue;
          } else if (event === "pull_request") {
            const targetBranch = payload.pull_request?.base?.ref;
            if (targetBranch !== rule.branch_filter) continue;
          }
        }

        await fetch(rule.discord_webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: messageContent,
            username: "GitBridge",
            avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          }),
        });
      }
    }

    await supabase.from("webhook_logs").insert({
      event: event,
      repo_id: repoId,
      status: "success",
      details: { delivered_to: rules.length }
    });

    return NextResponse.json({ success: true, delivered: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    
    await supabase.from("webhook_logs").insert({
      event: "unknown",
      repo_id: "unknown",
      status: "error",
      details: { error: err.message || "Unknown error" }
    });

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
