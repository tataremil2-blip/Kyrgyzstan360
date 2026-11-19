import data from "../data/routes/catalog.json";

type Localized = { en: string; ru: string };
export type Review = { status: "draft" | "verified"; verifiedAt: string | null; validUntil: string | null; verifiedBy: string | null };
type Sourced = { sourceIds: string[]; review: Review };
export type Place = Sourced & { id: string; name: Localized; coordinates: { latitude: number; longitude: number } | null; visitMinutes: number | null; openMonths: number[] | null; permit: { requirement: "unknown" | "reported-required" | "required" | "not-required"; leadDays: number | null } };
export type Segment = Sourced & { id: string; from: string; to: string; driveMinutes: number | null; distanceKm: number | null; bufferMinutes: number | null; openMonths: number[] | null; vehicleRequirements: string[] };
export type RouteDay = { day: number; title: Localized; description: Localized; stopIds: string[]; overnightPlaceId: string | null; overnightLabel: Localized | null; activityMinutes: number | null; bufferMinutes: number | null; review: Review };
export type CatalogRoute = Sourced & { id: string; name: Localized; durationDays: number; advertisedMonths: number[] | null; confirmedMonths: number[] | null; days: RouteDay[]; included: Localized[]; excluded: Localized[]; requirements: Localized[]; notes: string[] };
export type Tariff = Sourced & { id: string; routeId: string; amount: number; currency: "USD" | "EUR"; unit: "unknown" | "person" | "group"; kind: string; travelMode: string; seats: number | null };
export type RouteCatalog = {
  schemaVersion: number;
  sources: { id: string; file: string; locator: string; capturedAt: string; sha256: string }[];
  places: Place[]; segments: Segment[]; routes: CatalogRoute[]; tariffs: Tariff[];
};
export const routeCatalog = data as RouteCatalog;

function validDate(date: string | null): date is string {
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}
function isCurrent(review: Review, asOf: string) {
  return review.status === "verified" && Boolean(review.verifiedBy?.trim()) && validDate(review.verifiedAt) && validDate(review.validUntil) && review.verifiedAt <= asOf && asOf <= review.validUntil;
}
function validMonths(months: number[] | null): months is number[] {
  return Array.isArray(months) && months.length > 0 && new Set(months).size === months.length && months.every((month) => Number.isInteger(month) && month >= 1 && month <= 12);
}
const positive = (value: number | null) => value !== null && Number.isFinite(value) && value > 0;
const nonnegative = (value: number | null) => value !== null && Number.isFinite(value) && value >= 0;

/** Structural errors differ from incomplete draft fields, which are allowed. */
export function validateCatalog(catalog: RouteCatalog = routeCatalog): string[] {
  const errors: string[] = [];
  if (catalog.schemaVersion !== 1) errors.push("Unsupported schema version");
  for (const [name, records] of Object.entries({ sources: catalog.sources, places: catalog.places, segments: catalog.segments, routes: catalog.routes, tariffs: catalog.tariffs })) {
    const ids = new Set<string>();
    for (const record of records) {
      if (!record.id || ids.has(record.id)) errors.push(`${name}: duplicate or empty id ${record.id}`);
      ids.add(record.id);
    }
  }
  const sources = new Set(catalog.sources.map((source) => source.id));
  const places = new Set(catalog.places.map((place) => place.id));
  const routes = new Set(catalog.routes.map((route) => route.id));
  for (const record of [...catalog.places, ...catalog.segments, ...catalog.routes, ...catalog.tariffs]) {
    if (!record.sourceIds.length || record.sourceIds.some((id) => !sources.has(id))) errors.push(`${record.id}: missing source`);
    if (!["draft", "verified"].includes(record.review.status)) errors.push(`${record.id}: invalid review status`);
  }
  for (const place of catalog.places) {
    if (!place.name.en || !place.name.ru) errors.push(`${place.id}: missing translation`);
    if (place.coordinates && (!Number.isFinite(place.coordinates.latitude) || Math.abs(place.coordinates.latitude) > 90 || !Number.isFinite(place.coordinates.longitude) || Math.abs(place.coordinates.longitude) > 180)) errors.push(`${place.id}: invalid coordinates`);
  }
  for (const edge of catalog.segments) if (!places.has(edge.from) || !places.has(edge.to) || edge.from === edge.to) errors.push(`${edge.id}: invalid endpoints`);
  for (const route of catalog.routes) {
    if (!route.name.en || !route.name.ru || route.days.length !== route.durationDays || route.durationDays < 1) errors.push(`${route.id}: invalid duration or name`);
    route.days.forEach((day, index) => {
      if (day.day !== index + 1 || !day.title.en || !day.title.ru || !day.description.en || !day.description.ru) errors.push(`${route.id}/${index + 1}: invalid day or translation`);
      if (day.stopIds.some((id) => !places.has(id)) || (day.overnightPlaceId && !places.has(day.overnightPlaceId))) errors.push(`${route.id}/${index + 1}: unknown place`);
      for (let i = 1; i < day.stopIds.length; i++) if (!catalog.segments.some((edge) => edge.from === day.stopIds[i - 1] && edge.to === day.stopIds[i])) errors.push(`${route.id}/${index + 1}: missing directed segment`);
    });
  }
  for (const tariff of catalog.tariffs) if (!routes.has(tariff.routeId) || !positive(tariff.amount) || !["USD", "EUR"].includes(tariff.currency) || !["unknown", "person", "group"].includes(tariff.unit)) errors.push(`${tariff.id}: invalid tariff`);
  return errors;
}

/** Fail closed: a draft is useful for editing, never for automatic planning. */
export function generationReadiness(routeId: string, asOf: string, catalog: RouteCatalog = routeCatalog) {
  const blockers = validateCatalog(catalog);
  const route = catalog.routes.find((item) => item.id === routeId);
  if (!validDate(asOf)) blockers.push("invalid-check-date");
  if (!route) return { ready: false, blockers: [...blockers, "unknown-route"] };
  if (!isCurrent(route.review, asOf)) blockers.push("route-review-required");
  if (!validMonths(route.confirmedMonths)) blockers.push("route-season-required");
  route.days.forEach((day, index) => {
    const prefix = `day-${day.day}`;
    if (!isCurrent(day.review, asOf)) blockers.push(`${prefix}:review-required`);
    if (!day.stopIds.length) blockers.push(`${prefix}:locations-required`);
    if (!nonnegative(day.activityMinutes) || !nonnegative(day.bufferMinutes)) blockers.push(`${prefix}:timing-required`);
    if (index < route.days.length - 1 && !day.overnightPlaceId) blockers.push(`${prefix}:overnight-required`);
    if (index > 0 && route.days[index - 1].stopIds.at(-1) !== day.stopIds[0]) blockers.push(`${prefix}:connection-required`);
  });
  const ids = new Set(route.days.flatMap((day) => [...day.stopIds, ...(day.overnightPlaceId ? [day.overnightPlaceId] : [])]));
  for (const id of ids) {
    const place = catalog.places.find((item) => item.id === id);
    if (!place) continue;
    if (!isCurrent(place.review, asOf)) blockers.push(`${id}:place-review-required`);
    if (!place.coordinates) blockers.push(`${id}:coordinates-required`);
    if (!validMonths(place.openMonths) || !nonnegative(place.visitMinutes)) blockers.push(`${id}:season-or-visit-time-required`);
    if (!["required", "not-required"].includes(place.permit.requirement) || (place.permit.requirement === "required" && !nonnegative(place.permit.leadDays))) blockers.push(`${id}:permit-check-required`);
  }
  for (const day of route.days) for (let i = 1; i < day.stopIds.length; i++) {
    const edge = catalog.segments.find((item) => item.from === day.stopIds[i - 1] && item.to === day.stopIds[i]);
    if (!edge) continue;
    if (!isCurrent(edge.review, asOf) || !positive(edge.driveMinutes) || !positive(edge.distanceKm) || !nonnegative(edge.bufferMinutes) || !validMonths(edge.openMonths)) blockers.push(`${edge.id}:transfer-check-required`);
  }
  return { ready: blockers.length === 0, blockers: [...new Set(blockers)] };
}

export function getQuotableTariffs(routeId: string, asOf: string, catalog: RouteCatalog = routeCatalog): Tariff[] {
  if (!generationReadiness(routeId, asOf, catalog).ready) return [];
  return catalog.tariffs.filter((tariff) => tariff.routeId === routeId && tariff.unit !== "unknown" && isCurrent(tariff.review, asOf));
}
