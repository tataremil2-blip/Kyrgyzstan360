import { parseTripText } from "@/lib/planner-parser";
import { requestAiPlanner } from "@/lib/ai-planner";

export async function POST(request: Request) {
  const input: unknown = await request.json().catch(() => null);
  const text = input && typeof input === "object" && typeof (input as Record<string, unknown>).text === "string" ? (input as Record<string, string>).text.trim() : "";
  if (!text) return Response.json({ error: "Trip description is required." }, { status: 400 });
  if (text.length > 4000) return Response.json({ error: "Trip description is too long." }, { status: 400 });
  try {
    const ai = await requestAiPlanner(text);
    if (ai) return Response.json({ status: "ai-draft", parsed: ai, message: "AI extracted a draft. Review it before generating a route." });
  } catch (error) {
    console.error("Planner AI failed", error);
    return Response.json({ error: "The planner is temporarily unavailable. Please try again." }, { status: 503 });
  }
  return Response.json({ status: "draft", parsed: parseTripText(text), message: "The draft was extracted. Please review the airports, places and questions before generating a route." });
}
