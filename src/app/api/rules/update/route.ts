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
  const event = formData.get("event") as string;
  const branchFilter = formData.get("branch_filter") as string;
  const customTemplate = formData.get("custom_template") as string;
  const roleMention = formData.get("role_mention") as string;
  const threadId = formData.get("thread_id") as string;

  if (!ruleId || !event) {
    return NextResponse.redirect(new URL("/dashboard?error=MissingFields", request.url));
  }

  // Update the rule in the database, ensuring it belongs to the user
  const { error } = await supabase
    .from("rules")
    .update({
      trigger_event: event,
      branch_filter: branchFilter || null,
      custom_template: customTemplate || null,
      role_mention: roleMention || null,
      thread_id: threadId || null,
    })
    .eq("id", ruleId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating rule:", error);
    return NextResponse.redirect(new URL("/dashboard?error=UpdateFailed", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard?success=RuleUpdated", request.url));
}
