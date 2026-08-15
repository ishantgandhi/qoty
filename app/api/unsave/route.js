import { supabase } from "@/lib/supabase";

export async function DELETE(request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing quote id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("Supabase delete failed:", error);
    return Response.json({ error: "Failed to unsave quote." }, { status: 500 });
  }

  if (!data?.length) {
    return Response.json({ error: "Quote not found." }, { status: 404 });
  }

  return Response.json({ message: "Quote unsaved." }, { status: 200 });
}
