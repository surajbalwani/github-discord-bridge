import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = `${new URL(request.url).origin}/api/discord/callback`;
  const scope = "identify guilds"; // We request identify to know who they are, and guilds to see their servers

  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(discordAuthUrl);
}
