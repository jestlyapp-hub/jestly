import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ email: null });
    }
    return NextResponse.json({ email: user.email });
  } catch {
    return NextResponse.json({ email: null });
  }
}
