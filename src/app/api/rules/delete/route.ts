import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();
  const ruleId = formData.get("rule_id") as string;

  if (ruleId) {
    // Delete the rule only if it belongs to the current user
    await supabase.from("rules").delete().eq("id", ruleId).eq("user_id", user.id);
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
