import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Clear Discord token from profile
  const { error } = await supabase
    .from("profiles")
    .update({ discord_token: null })
    .eq("id", user.id);

  if (error) {
    console.error("Error disconnecting Discord:", error);
    return NextResponse.redirect(new URL("/dashboard/settings?error=DisconnectFailed", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard/settings?success=DiscordDisconnected", request.url));
}
