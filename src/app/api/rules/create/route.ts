import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();
  const repoRaw = formData.get("repo") as string;
  const event = formData.get("event") as string;
  const branchFilter = formData.get("branch_filter") as string;
  const customTemplate = formData.get("custom_template") as string;
  const roleMention = formData.get("role_mention") as string;
  const threadId = formData.get("thread_id") as string;

  if (!repoRaw || !event) {
    return NextResponse.redirect(new URL("/dashboard/new?error=MissingFields", request.url));
  }

  const [repoId, repoFullName] = repoRaw.split("|");

  // Create a pending rule in the database. 
  // We will fill in the discord details later.
  const { data: rule, error } = await supabase.from("rules").insert({
    user_id: user.id,
    github_repo_id: repoId,
    github_repo_full_name: repoFullName,
    trigger_event: event,
    branch_filter: branchFilter || null,
    custom_template: customTemplate || null,
    role_mention: roleMention || null,
    thread_id: threadId || null,
    discord_webhook_url: "pending", // Placeholder
    discord_channel_id: "pending",
    discord_channel_name: "pending",
    discord_guild_id: "pending",
    discord_guild_name: "pending",
  }).select().single();

  if (error || !rule) {
    console.error("Error creating rule:", error);
    return NextResponse.redirect(new URL("/dashboard/new?error=DatabaseError", request.url));
  }

  // Now redirect to Discord Webhook OAuth flow, passing the rule ID as the state
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = `${new URL(request.url).origin}/api/discord/webhook-callback`;
  const scope = "webhook.incoming";
  const state = rule.id;

  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(discordAuthUrl);
}
