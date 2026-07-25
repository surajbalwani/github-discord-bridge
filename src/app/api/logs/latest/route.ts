import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get("repo_id");
  const event = searchParams.get("event");
  const since = searchParams.get("since"); // timestamp to only get VERY recent logs

  if (!repoId || !event) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the latest log for this repo and event
  let query = supabase
    .from("webhook_logs")
    .select("*")
    .eq("repo_id", repoId)
    .eq("event_type", event)
    .order("created_at", { ascending: false })
    .limit(1);

  if (since) {
    query = query.gte("created_at", new Date(parseInt(since)).toISOString());
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return NextResponse.json({ log: null });
  }

  return NextResponse.json({ log: data[0] });
}
