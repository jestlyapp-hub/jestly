import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/clients/[id]/notes
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("client_notes") as any)
    .select("*")
    .eq("client_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST /api/clients/[id]/notes
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  // Create the note
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: note, error } = await (supabase.from("client_notes") as any)
    .insert({ user_id: user.id, client_id: id, content: content.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert event for timeline
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("client_events") as any)
    .insert({
      user_id: user.id,
      client_id: id,
      type: "note_added",
      payload: { note_id: note.id, preview: content.trim().slice(0, 100) },
    });

  return NextResponse.json(note, { status: 201 });
}
