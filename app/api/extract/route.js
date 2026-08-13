import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const fieldSchema = {
  type: "object",
  properties: {
    value: { type: ["number", "null"] },
    basis: { type: "string" },
    is_estimate: { type: "boolean" },
  },
  required: ["value", "basis", "is_estimate"],
  additionalProperties: false,
};

const tools = [
  {
    name: "extract_quote_fields",
    description: `Extract four pricing fields from a hotel quote email or proposal: total cost, guestroom total, meeting room total, and food & beverage total.

Each field has three parts: value (the number, or null), basis (a short explanation of how it was derived), and is_estimate (true if the value involved assuming an unconfirmed condition or judgment call, false if it was directly stated or reliably computed from stated figures).

The source text may be in a language other than English. Extract and reason about it the same way regardless of language; if the source is not in English, note the detected language briefly in basis alongside your normal explanation.

If the source text contains multiple versions of the same quote (e.g. an initial email followed by a revised or updated quote later in the same thread), use the most recent stated figures, and note in basis that an earlier version was superseded.

Some quotes are priced as a single all-inclusive package (e.g. "$500 per person, all-inclusive") rather than broken into separate guestroom, meeting room, and F&B figures. In that case, set total_quote to the stated package total, and set guestroom_total, meeting_room_total, and fb_total to null with basis noting the price is bundled and cannot be broken down from the text.

Values are often not stated directly — compute them when the source data allows it (e.g. multiply a nightly rate by total room-nights to get a guestroom total). This kind of computation from clearly stated figures is NOT an estimate — set is_estimate to false.

Distinguish between a stated minimum (e.g. an F&B minimum required by the hotel) and a confirmed total — these are not the same thing, and this distinction should be captured in basis. When only a numeric F&B minimum is stated, that number IS fb_total.value, with is_estimate false, since it's a directly stated figure (even though it's a minimum, not a guaranteed final spend).

Prefer giving a best-effort estimate over returning null whenever the text provides enough information to reason toward a plausible figure. Only return null when there is truly no information in the text to base any estimate on for that field (e.g. no rate, no room count, no pricing mentioned at all for that component). When you return null, set is_estimate to false, and set basis to exactly: "No data found for this field after scanning the provided text." Do not vary this phrasing — use it exactly as written whenever a field is null due to complete absence of relevant information.

When a waiver or complimentary rate depends only on a stated pricing threshold within this same quote (e.g. "waived with a $20,000 F&B minimum"), treat that threshold as the operative basis for the quote and set the waived field to 0, with is_estimate false.

When a waiver or complimentary rate depends on a future performance condition that cannot be known from a quote alone (e.g. "85% guestroom block utilization," an attendance or usage target), do not simply assume it is met. Instead, give your best estimate: if the rest of the quote's numbers (attendee count, room block size) suggest the condition is plausible or likely, use the waived value (0) and note in basis that this assumes the condition is met, flagging it as an estimate. If the condition seems unlikely or there's no basis to judge, use the non-waived/alternate rate if one is stated in the text, and note the assumption in basis. Attrition and cancellation percentages describe refund/cancellation policy, not waiver conditions, and should not be treated as conditions on a waiver.

When the text presents mutually exclusive pricing options (e.g. 'waived with $X F&B minimum, OR $Y without it'), select the single scenario consistent with your best estimate of which applies, rather than combining both, and set is_estimate accordingly.

For every field, value must be a base stated or directly computed figure only — never layer in taxes, service charges, or fees unless the source text presents a single combined final number with no separate base figure available. Do not perform multi-step tax or fee arithmetic; if you find yourself calculating more than one addition or multiplication step, stop and use the simplest grounded figure instead.

For total_quote specifically: if the source text explicitly states an overall total, use that stated figure directly, set is_estimate false, and note in basis that it was stated. If no overall total is stated, compute it as the best-effort sum of guestroom_total, meeting_room_total, and fb_total. If any of those three has is_estimate true, total_quote's is_estimate must also be true, and basis should say which component(s) are estimated. If all three components are null, total_quote should also be null with is_estimate false and basis set to exactly: "No data found for this field after scanning the provided text."`,
    input_schema: {
      type: "object",
      required: [
        "total_quote",
        "guestroom_total",
        "meeting_room_total",
        "fb_total",
      ],
      additionalProperties: false,
      properties: {
        total_quote: fieldSchema,
        guestroom_total: fieldSchema,
        meeting_room_total: fieldSchema,
        fb_total: fieldSchema,
      },
    },
    input_examples: [
      {
        total_quote: {
          value: 66080,
          basis: "computed: guestroom_total + meeting_room_total + fb_total",
          is_estimate: false,
        },
        guestroom_total: {
          value: 46080,
          basis: "computed: $192/night × 240 room-nights",
          is_estimate: false,
        },
        meeting_room_total: {
          value: 0,
          basis: "waived with $20,000 F&B minimum (single stated threshold, no other conditions)",
          is_estimate: false,
        },
        fb_total: {
          value: 20000,
          basis: "stated F&B minimum of $20,000; not a confirmed spend total",
          is_estimate: false,
        },
      },
      {
        total_quote: {
          value: 139600,
          basis: "sum of guestroom_total + meeting_room_total (estimated) + fb_total",
          is_estimate: true,
        },
        guestroom_total: {
          value: 87600,
          basis: "computed: $219/night × 400 room-nights",
          is_estimate: false,
        },
        meeting_room_total: {
          value: 0,
          basis: "waiver requires 85% block utilization AND F&B minimum; utilization not confirmed, assumed likely given group size — this is an estimate",
          is_estimate: true,
        },
        fb_total: {
          value: 52000,
          basis: "stated as minimum, not confirmed total",
          is_estimate: false,
        },
      },
      {
        total_quote: {
          value: null,
          basis: "No data found for this field after scanning the provided text.",
          is_estimate: false,
        },
        guestroom_total: {
          value: null,
          basis: "No data found for this field after scanning the provided text.",
          is_estimate: false,
        },
        meeting_room_total: {
          value: null,
          basis: "No data found for this field after scanning the provided text.",
          is_estimate: false,
        },
        fb_total: {
          value: null,
          basis: "No data found for this field after scanning the provided text.",
          is_estimate: false,
        },
      },
      {
        total_quote: {
          value: 40000,
          basis: "stated as an all-inclusive package price of $500/person for 80 attendees; not broken down further in the source text",
          is_estimate: false,
        },
        guestroom_total: {
          value: null,
          basis: "price is bundled into an all-inclusive package total and cannot be broken down from the text",
          is_estimate: false,
        },
        meeting_room_total: {
          value: null,
          basis: "price is bundled into an all-inclusive package total and cannot be broken down from the text",
          is_estimate: false,
        },
        fb_total: {
          value: null,
          basis: "price is bundled into an all-inclusive package total and cannot be broken down from the text",
          is_estimate: false,
        },
      },
    ],
    strict: true,
  },
];

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

  const { text } = body;

  // #8 — validate text exists and isn't empty
  if (typeof text !== "string" || text.trim().length === 0) {
    return Response.json(
      { error: "No text provided to extract from" },
      { status: 400 }
    );
  }

  // #7 — guard against near-empty normalized text (e.g. failed PDF extraction)
  if (text.trim().length < 20) {
    return Response.json(
      emptyResult(
        "The provided text was too short to scan for pricing information — check that the source file extracted correctly."
      )
    );
  }

  let response;
  try {
    // #9 — wrap the Claude call, don't let API failures crash unhandled
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

  // #11 — defensive shape checks even under strict mode
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

  return Response.json(result);
}