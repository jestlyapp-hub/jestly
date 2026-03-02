import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/public/checkout — public checkout via RPC
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { site_id, product_id, name, email, phone, message, form_data } = body;

  if (!site_id || !product_id || !name || !email) {
    return NextResponse.json(
      { error: "site_id, product_id, name and email are required" },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("fn_public_checkout", {
    p_site_id: site_id,
    p_product_id: product_id,
    p_name: name,
    p_email: email,
    p_phone: phone || null,
    p_message: message || null,
    p_form_data: form_data || {},
  });

  if (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
