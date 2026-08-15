import { z } from "zod";

export const fieldSchema = z.object({
  value: z.number().nullable(),
  basis: z.string(),
  is_estimate: z.boolean(),
  source: z.string().nullable(),
});

export const quoteSchema = z.object({
  total_quote: fieldSchema,
  guestroom_total: fieldSchema,
  meeting_room_total: fieldSchema,
  fb_total: fieldSchema,
});

export const quoteExtractionInstructions = `Extract four pricing fields from a hotel quote email or proposal: total cost, guestroom total, meeting room total, and food & beverage total.

Each field has four parts: value (the number, or null), basis (a short explanation of how it was derived), is_estimate (true if the value involved assuming an unconfirmed condition or judgment call, false if it was directly stated or reliably computed from stated figures), and source (which labeled input the value came from, or null).

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

For total_quote specifically: if the source text explicitly states an overall total, use that stated figure directly, set is_estimate false, and note in basis that it was stated. If no overall total is stated, compute it as the best-effort sum of guestroom_total, meeting_room_total, and fb_total. If any of those three has is_estimate true, total_quote's is_estimate must also be true, and basis should say which component(s) are estimated. If all three components are null, total_quote should also be null with is_estimate false and basis set to exactly: "No data found for this field after scanning the provided text."

When multiple sources are provided (each marked with a "--- Source: label ---" header in the text), and a field's value is drawn primarily from one specific source, set source to that source's exact label as written in the header. If a value is not drawn from any single identifiable source (e.g. the input has only one source, or the value was computed by combining figures from multiple sources), set source to null.`;
