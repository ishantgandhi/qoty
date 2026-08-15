import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch quotes:", error);
    return Response.json(
      { error: "Failed to load saved quotes." },
      { status: 500 }
    );
  }

  return Response.json({ quotes: data });
}