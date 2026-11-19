export type RouteAdvisorInput = { selectedPlaceCount: number; knownPlaceDays: number; unknownPlaceCount: number; selectedCountryCount: number; tripDays: number; hasArrival: boolean; hasDeparture: boolean };
export type RouteAdvisorMessage = { level: "info" | "attention"; key: string };
export function adviseRoute(input: RouteAdvisorInput): RouteAdvisorMessage[] {
  const messages: RouteAdvisorMessage[] = [];
  if (!input.hasArrival || !input.hasDeparture) messages.push({ level: "attention", key: "airports" });
  if (input.unknownPlaceCount > 0) messages.push({ level: "attention", key: "unknownDuration" });
  if (input.selectedCountryCount > 1) messages.push({ level: "attention", key: "borders" });
  if (input.selectedPlaceCount > 0 && input.knownPlaceDays > input.tripDays) messages.push({ level: "attention", key: "tooDense" });
  if (input.selectedPlaceCount === 0) messages.push({ level: "info", key: "empty" });
  return messages;
}
