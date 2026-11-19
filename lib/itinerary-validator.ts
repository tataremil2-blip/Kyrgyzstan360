export type ItineraryDay = { day: number; title: string; placeId: string; activities: string[]; overnightPlaceId: string | null };
export function validateItinerary(days: ItineraryDay[], requestedDays: number | null) {
  const errors: string[] = [];
  if (!Array.isArray(days) || days.length === 0) return ["empty"];
  if (requestedDays && days.length > requestedDays) errors.push("too-many-days");
  days.forEach((item, index) => {
    if (item.day !== index + 1) errors.push(`day-${index + 1}-sequence`);
    if (!item.title?.trim() || !item.placeId?.trim()) errors.push(`day-${index + 1}-location`);
    if (!Array.isArray(item.activities)) errors.push(`day-${index + 1}-activities`);
    if (index < days.length - 1 && !item.overnightPlaceId) errors.push(`day-${index + 1}-overnight`);
  });
  return errors;
}
