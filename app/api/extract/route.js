import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const fieldSchema = {
  type: "object",
  properties: {
    value: { type: ["number", "null"] },
    basis: { type: "string" },
  },
  required: ["value", "basis"],
  additionalProperties: false,
};

const tools = [
  {
    name: "extract_quote_fields",
    description: `Extract four pricing fields from a hotel quote email or proposal: total cost, guestroom total, meeting room total, and food & beverage total.

Values are often not stated directly — compute them when the source data allows it (e.g. multiply a nightly rate by total room-nights to get a guestroom total).

Distinguish between a stated minimum (e.g. an F&B minimum required by the hotel) and a confirmed total — these are not the same thing, and this distinction should be captured in the basis field. When only a numeric F&B minimum is stated, that number IS fb_total.value; do not return null just because it is a minimum rather than confirmed spend.

If a field cannot be determined from the text, return null for its value and explain why in basis (e.g. 'not stated in email'). Never return a value that isn't grounded in the provided text.

When a waiver or complimentary rate depends only on a stated pricing threshold within this same quote (e.g. "waived with a $20,000 F&B minimum"), treat that threshold as the operative basis for the quote and set the waived field to 0 — do not require separate proof of actual spend, and do not return null for this case.

When a waiver or complimentary rate depends on a future performance condition that cannot be known from a quote alone (e.g. "85% guestroom block utilization," an attendance or usage target), do not assume that condition is met unless the text confirms it. If the waiver requires this kind of condition together with a pricing threshold, and the performance condition is not confirmed, return null for the waived field rather than 0, and explain the unconfirmed condition in basis. Attrition and cancellation percentages describe refund/cancellation policy, not waiver conditions, and should not be treated as conditions on a waiver.

When the text presents mutually exclusive pricing options (e.g. 'waived with $X F&B minimum, OR $Y without it'), select the single scenario consistent with the rest of your extraction rather than combining both.

For every field, value must be a base stated or directly computed figure only — never layer in taxes, service charges, or fees unless the source text presents a single combined final number with no separate base figure available. If tax or service charge details are mentioned in the source, you may note them in basis for context, but do not fold them into value. Do not perform multi-step tax or fee arithmetic; if you find yourself calculating more than one addition or multiplication step, stop and use the simplest grounded figure instead.

For total_quote specifically: if the source text explicitly states an overall total, use that stated figure directly and note in basis that it was stated, not computed. If no overall total is stated, compute it as the sum of guestroom_total, meeting_room_total, and fb_total, with no additional adjustments. If any of those three fields is null, total_quote should also be null, with basis explaining that a full total could not be computed due to a missing component.`,
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
        },
        guestroom_total: {
          value: 46080,
          basis: "computed: $192/night × 240 room-nights",
        },
        meeting_room_total: {
          value: 0,
          basis: "waived with $20,000 F&B minimum (single stated threshold, no other conditions)",
        },
        fb_total: {
          value: 20000,
          basis: "stated F&B minimum of $20,000; not a confirmed spend total",
        },
      },
      {
        total_quote: { value: null, basis: "not stated in email" },
        guestroom_total: {
          value: 87600,
          basis: "computed: $219/night × 400 room-nights",
        },
        meeting_room_total: {
          value: null,
          basis:
            "waiver requires 85% guestroom block utilization AND F&B minimum; block utilization not confirmed in text, so waiver cannot be assumed",
        },
        fb_total: {
          value: 52000,
          basis: "stated as minimum, not confirmed total",
        },
      },
      {
        total_quote: { value: null, basis: "not stated in email" },
        guestroom_total: { value: null, basis: "not stated in email" },
        meeting_room_total: { value: null, basis: "not stated in email" },
        fb_total: { value: null, basis: "not stated in email" },
      },
    ],
    strict: true,
  },
];

export async function POST(request) {
  const { text } = await request.json();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    messages: [{ role: "user", content: text }],
    max_tokens: 1024,
    tools,
    tool_choice: { type: "tool", name: "extract_quote_fields" },
  });
  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse) {
    return Response.json({ error: "No tool use found" }, { status: 500 });
  }
  const result = toolUse.input;
  const { guestroom_total, meeting_room_total, fb_total } = result;
  if (
    guestroom_total?.value != null &&
    meeting_room_total?.value != null &&
    fb_total?.value != null
  ) {
    result.total_quote.value =
      guestroom_total.value + meeting_room_total.value + fb_total.value;
    result.total_quote.basis =
      "computed in code: sum of guestroom_total + meeting_room_total + fb_total";
  }
  return Response.json(result);
}