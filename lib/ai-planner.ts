import { validateItinerary, type ItineraryDay } from "./itinerary-validator";
export type AiPlannerResult = { days: number | null; arrivalAirport: string; departureAirport: string; destinationIds: string[]; questions: string[]; summary: string; itinerary: ItineraryDay[] };

export async function requestAiPlanner(text: string): Promise<AiPlannerResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_PLANNER_MODEL ?? "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST", signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: [{ role: "system", content: "Extract trip wishes and propose a clearly marked draft. Return JSON with keys days (number|null), arrivalAirport (bishkek|almaty|tashkent|''), departureAirport (bishkek|almaty|tashkent|''), destinationIds (array of known IDs or []), questions (array), summary (short), itinerary (array of {day,title,placeId,activities,overnightPlaceId}). Use only known place IDs. Never invent route times, prices, availability or border permissions. Itinerary is a draft and must be checked." }, { role: "user", content: text }], text: { format: { type: "json_object" } } }),
  });
  if (!response.ok) throw new Error(`AI planner response: ${response.status}`);
  const body = await response.json() as { output_text?: string };
  if (!body.output_text) throw new Error("AI planner returned no text");
  const parsed = JSON.parse(body.output_text) as Partial<AiPlannerResult>;
  const allowed = new Set<string>(destinations.map((place) => place.id));
  const itinerary = Array.isArray(parsed.itinerary) ? parsed.itinerary.filter((item): item is ItineraryDay => Boolean(item && typeof item === "object" && typeof item.day === "number" && typeof item.title === "string" && typeof item.placeId === "string" && Array.isArray(item.activities))).map((item) => ({ ...item, activities: item.activities.filter((activity): activity is string => typeof activity === "string"), overnightPlaceId: typeof item.overnightPlaceId === "string" ? item.overnightPlaceId : null })).filter((item) => allowed.has(item.placeId) && (!item.overnightPlaceId || allowed.has(item.overnightPlaceId))) : [];
  const safeDays = typeof parsed.days === "number" ? parsed.days : null;
  return { days: safeDays, arrivalAirport: ["bishkek", "almaty", "tashkent"].includes(parsed.arrivalAirport ?? "") ? parsed.arrivalAirport! : "", departureAirport: ["bishkek", "almaty", "tashkent"].includes(parsed.departureAirport ?? "") ? parsed.departureAirport! : "", destinationIds: Array.isArray(parsed.destinationIds) ? parsed.destinationIds.filter((id): id is string => typeof id === "string" && allowed.has(id)) : [], questions: Array.isArray(parsed.questions) ? parsed.questions.filter((item): item is string => typeof item === "string") : [], summary: typeof parsed.summary === "string" ? parsed.summary : "", itinerary: validateItinerary(itinerary, safeDays).length ? [] : itinerary };
}
import { destinations } from "./planner";

