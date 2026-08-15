import { normalizeMultipleInputs } from "@/lib/normalize";
import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { quoteExtractionInstructions, quoteSchema } from "@/lib/quote-schema";

export const maxDuration = 60;

const MODEL_MAP = {
  "gpt-5.4-mini": openai("gpt-5.4-mini"),
  "gemini-3.7-flash": google("gemini-3.7-flash"),
  "claude-sonnet": anthropic("claude-sonnet-5"),
};

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

  if (!Array.isArray(inputs) || inputs.length === 0) {
    // No inputs provided to extract from
    return Response.json(
      { error: "No inputs provided to extract from" },
      { status: 400 },
    );
  }

  const modelKey = MODEL_MAP[body.model] ? body.model : "gpt-5.4-mini";
  const model = MODEL_MAP[modelKey];
  if (!model) {
    return Response.json({ error: "Invalid model" }, { status: 400 });
  }

  const normalizeInputs = inputs.map((input, i) => {
    // Normalize inputs to be used in the Claude call
    if (input.type === "pdf") {
      // PDF input convert to base64 so it is actual text
      return {
        input: Buffer.from(input.content, "base64"),
        type: "pdf",
        label: input.label || `attachment_${i + 1}.pdf`,
      };
    }
    return {
      input: input.content,
      type: input.type,
      label:
        input.label || (input.type === "html" ? "Pasted email" : "Pasted text"),
    };
  });
  let text;
  try {
    text = await normalizeMultipleInputs(normalizeInputs);
  } catch (err) {
    console.error("Failed to normalize inputs:", err);
    return Response.json(
      {
        error:
          "Failed to read one or more inputs. Check that PDFs and HTML extracted correctly.",
      },
      { status: 500 },
    );
  }

  const distinctTypes = [...new Set(inputs.map((i) => i.type))];
  const sourceType = distinctTypes.length > 1 ? "combined" : distinctTypes[0];

  if (typeof text !== "string" || text.trim().length === 0) {
    // No text provided to extract from
    return Response.json(
      { error: "No text provided to extract from" },
      { status: 400 },
    );
  }

  if (text.trim().length < 20) {
    // Too short to scan for pricing information
    return Response.json(
      emptyResult(
        "The provided text was too short to scan for pricing information — check that the source file extracted correctly.",
      ),
    );
  }

  let result;
  try {
    const { output } = await generateText({
      model: model,
      system: quoteExtractionInstructions, // your long description text — see below
      output: Output.object({ schema: quoteSchema }),
      prompt: text,
    });
    result = output;
  } catch (err) {
    console.error("Extraction call failed:", err);
    return Response.json(
      {
        error: "Extraction service is currently unavailable. Please try again.",
      },
      { status: 502 },
    );
  }

  const { guestroom_total, meeting_room_total, fb_total, total_quote } = result;

  let computedTotal = null;
  if (
    guestroom_total.value != null &&
    meeting_room_total.value != null &&
    fb_total.value != null
  ) {
    computedTotal =
      guestroom_total.value + meeting_room_total.value + fb_total.value;
  }

  result.total_quote_check = {
    computed_value: computedTotal,
    matches_extraction:
      computedTotal !== null && total_quote.value === computedTotal,
  };

  return Response.json({
    ...result,
    _metadata: { sourceType, rawText: text, model: modelKey },
  });
}
