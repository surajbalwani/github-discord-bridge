import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // To delete an auth user, you usually need the admin API. 
  // For a user to self-delete their data, we can delete their profile and rules.
  // We'll delete profile, rules, and sign them out.
  
  await supabase.from("rules").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);

  // Sign out
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/?message=AccountDeleted", request.url));
}
