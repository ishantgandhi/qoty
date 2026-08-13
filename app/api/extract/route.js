import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { normalizeMultipleInputs } from "@/lib/normalize";
import { tools } from "@/lib/extract-tools";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function emptyResult(reason) {
  const basis = reason;
  return {
    total_quote: { value: null, basis, is_estimate: false },
    guestroom_total: { value: null, basis, is_estimate: false },
    meeting_room_total: { value: null, basis, is_estimate: false },
    fb_total: { value: null, basis, is_estimate: false },
    total_quote_check: { computed_value: null, matches_extraction: false },
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { inputs } = body;

  if (!Array.isArray(inputs) || inputs.length === 0) { // No inputs provided to extract from
    return Response.json(
      { error: "No inputs provided to extract from" },
      { status: 400 }
    );
  }

  const normalizeInputs = inputs.map((input, i) => { // Normalize inputs to be used in the Claude call
    if (input.type === "pdf") { // PDF input convert to base64 so it is actual text
      return {
        input: Buffer.from(input.content, "base64"),
        type: "pdf",
        label: input.label || `attachment_${i + 1}.pdf`,
      };
    }
    return {
      input: input.content,
      type: input.type,
      label: input.label || (input.type === "html" ? "Pasted email" : "Pasted text"),
    };
  });
  let text;
  try {
    text = await normalizeMultipleInputs(normalizeInputs);
  } catch (err) {
    console.error("Failed to normalize inputs:", err);
    return Response.json(
      { error: "Failed to read one or more inputs. Check that PDFs and HTML extracted correctly." },
      { status: 500 }
    );
  }

  const distinctTypes = [...new Set(inputs.map((i) => i.type))]; 
  const sourceType = distinctTypes.length > 1 ? "combined" : distinctTypes[0];

  if (typeof text !== "string" || text.trim().length === 0) { // No text provided to extract from
    return Response.json(
      { error: "No text provided to extract from" },
      { status: 400 }
    );
  }

  if (text.trim().length < 20) { // Too short to scan for pricing information
    return Response.json(
      emptyResult(
        "The provided text was too short to scan for pricing information — check that the source file extracted correctly."
      )
    );
  }

  let response;
  try {
    response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      messages: [{ role: "user", content: text }],
      max_tokens: 1024,
      tools,
      tool_choice: { type: "tool", name: "extract_quote_fields" },
    });
  } catch (err) {
    console.error("Anthropic API call failed:", err);
    return Response.json(
      { error: "Extraction service is currently unavailable. Please try again." },
      { status: 502 }
    );
  }

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse) {
    return Response.json({ error: "No tool use found" }, { status: 500 });
  }

  const result = toolUse.input;

  const requiredFields = ["total_quote", "guestroom_total", "meeting_room_total", "fb_total"];
  const hasAllFields = requiredFields.every(
    (key) => result?.[key] && typeof result[key] === "object" && "value" in result[key]
  );
  if (!hasAllFields) {
    console.error("Malformed extraction result:", result);
    return Response.json(
      { error: "Extraction returned an unexpected shape. Please try again." },
      { status: 500 }
    );
  }

  const { guestroom_total, meeting_room_total, fb_total, total_quote } = result;

  let computedTotal = null;
  if (
    guestroom_total.value != null &&
    meeting_room_total.value != null &&
    fb_total.value != null
  ) {
    computedTotal = guestroom_total.value + meeting_room_total.value + fb_total.value;
  }

  result.total_quote_check = {
    computed_value: computedTotal,
    matches_extraction: computedTotal !== null && total_quote.value === computedTotal,
  };
  const { error: insertError } = await supabase.from("quotes").insert({ // Save the extraction result to the database
    source_type: sourceType,
    raw_text: text,
    total_quote: result.total_quote.value,
    guestroom_total: result.guestroom_total.value,
    meeting_room_total: result.meeting_room_total.value,
    fb_total: result.fb_total.value,
    field_basis: result,
  });
  
  if (insertError) { // If the insert fails, log the error
    console.error("Supabase insert failed:", insertError);
  }

  return Response.json(result);
}