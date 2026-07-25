import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard?error=NoCode`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = `${origin}/api/discord/callback`;

  // Exchange code for token
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

  if (tokenData.access_token) {
    // Save to profiles table
    await supabase.from("profiles").update({
      discord_token: tokenData.access_token,
    }).eq("id", user.id);
  } else {
    console.error("Discord OAuth Error:", tokenData);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
