import { supabase } from "@/lib/supabase";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    total_quote,
    guestroom_total,
    meeting_room_total,
    fb_total,
    total_quote_check,
    _metadata = {},
  } = body;
  const { sourceType, rawText } = _metadata;

  if (
    !total_quote ||
    !sourceType ||
    !rawText ||
    !guestroom_total ||
    !meeting_room_total ||
    !fb_total ||
    !total_quote_check
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("quotes").insert({
    source_type: sourceType,
    raw_text: rawText,
    total_quote: total_quote.value,
    guestroom_total: guestroom_total.value,
    meeting_room_total: meeting_room_total.value,
    fb_total: fb_total.value,
    computed_total: total_quote_check.computed_value,
    field_basis: {
      total_quote,
      guestroom_total,
      meeting_room_total,
      fb_total,
      total_quote_check,
    },
  });

  if (insertError) {
    console.error("Supabase insert failed:", insertError);
    return Response.json(
      {
        error: "Quote extracted but failed to save. Please try again.",
        total_quote,
        guestroom_total,
        meeting_room_total,
        fb_total,
        total_quote_check,
      },
      { status: 500 },
    );
  }

  return Response.json(
    { message: "Quote saved successfully" },
    { status: 200 },
  );
}
