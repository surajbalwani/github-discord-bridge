import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const ruleId = searchParams.get("state");
  
  if (!code || !ruleId) {
    return NextResponse.redirect(`${origin}/dashboard?error=InvalidCallback`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = `${origin}/api/discord/webhook-callback`;

  // Exchange code for webhook info
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.webhook) {
    console.error("No webhook in token response:", tokenData);
    // Delete the pending rule
    await supabase.from("rules").delete().eq("id", ruleId);
    return NextResponse.redirect(`${origin}/dashboard?error=DiscordWebhookFailed`);
  }

  const webhook = tokenData.webhook;

  // 1. Update the rule in Supabase with Discord webhook info
  const { data: rule, error } = await supabase.from("rules").update({
    discord_webhook_url: webhook.url,
    discord_channel_id: webhook.channel_id,
    discord_channel_name: webhook.name || "Unknown Channel",
    discord_guild_id: webhook.guild_id,
    discord_guild_name: "Connected Server", // Discord doesn't return guild name here, but we can fetch it later if needed
  }).eq("id", ruleId).select().single();

  if (error || !rule) {
    console.error("Error updating rule:", error);
    return NextResponse.redirect(`${origin}/dashboard?error=RuleUpdateFailed`);
  }

  // 2. Create the Webhook in GitHub
  // First, get the user's GitHub token
  const { data: profile } = await supabase.from("profiles").select("github_token").eq("id", user.id).single();
  
  if (profile?.github_token) {
    const githubWebhookUrl = `${origin}/api/webhooks/github`;
    
    // Determine events to subscribe to
    const events = rule.trigger_event === "*" ? ["*"] : [rule.trigger_event];

    const githubRes = await fetch(`https://api.github.com/repos/${rule.github_repo_full_name}/hooks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${profile.github_token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "web",
        active: true,
        events: events,
        config: {
          url: githubWebhookUrl,
          content_type: "json",
          insecure_ssl: "0"
        }
      })
    });

    if (!githubRes.ok) {
      const ghErr = await githubRes.text();
      console.error("Failed to create GitHub Webhook:", ghErr);
      // We might want to warn the user, but the rule is saved. 
      // If the webhook already exists, GitHub might return 422.
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
