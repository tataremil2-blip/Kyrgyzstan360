import { airports, destinations, experiences, type AirportId, type DestinationId, type ExperienceId } from "./planner";

const aliases: Record<string, string[]> = {
  bishkek: ["бишкек", "bishkek", "манас", "manas"], almaty: ["алматы", "almaty"], tashkent: ["ташкент", "tashkent"],
  "issyk-kul": ["иссык-куль", "иссык кул", "issyk-kul", "issyk kul"], karakol: ["каракoл", "каракoл", "karakol"],
  "song-kul": ["сон-куль", "сон кул", "song-kul", "song kul"], "kel-suu": ["кель-суу", "кель суу", "kel-suu", "kel suu"],
  "tash-rabat": ["таш-рабат", "таш рабат", "tash-rabat", "tash rabat"], "sary-chelek": ["сары-челек", "сары челек", "sary-chelek"],
};
const experienceAliases: Record<ExperienceId, string[]> = {
  jeep: ["4×4", "4x4", "джип", "внедорожник", "jeep", "4x4 adventure"],
  horses: ["конн", "лошад", "верхов", "horse", "riding"],
  hiking: ["поход", "трек", "хайкинг", "горы", "hiking", "trekking"],
  yurts: ["юрт", "yurt", "юрте", "ночевк", "ночёвк"],
  eagles: ["шоу орлов", "орлов", "беркут", "беркутчи", "eagle", "eagles"],
  springs: ["горячие источники", "термальн", "hot spring", "springs"],
  winter: ["фрирайд", "лыж", "сноуборд", "ski", "freeride"],
  culture: ["культур", "традиц", "ремесл", "culture", "tradition"],
};
function has(text: string, id: string) { return (aliases[id] ?? [id]).some((alias) => text.includes(alias)); }
export type ParsedTripText = { days: number | null; arrivalAirport: AirportId | ""; departureAirport: AirportId | ""; destinations: DestinationId[]; experiences: ExperienceId[]; questions: string[] };
export function parseTripText(input: string): ParsedTripText {
  const text = input.trim().toLocaleLowerCase();
  const days = Number(text.match(/(?:на|for|duration|дней|days)\s*(\d{1,2})/)?.[1] ?? text.match(/(\d{1,2})\s*(?:дн|day)/)?.[1] ?? 0);
  const arrival = airports.find((airport) => aliases[airport.id]?.some((alias) => new RegExp(`(?:прилетаю|прилет|arrive|arrival)[^.!?]{0,35}${alias}`).test(text)));
  const departure = airports.find((airport) => aliases[airport.id]?.some((alias) => new RegExp(`(?:улетаю|вылет|departure|fly)[^.!?]{0,35}${alias}`).test(text)));
  const selected = destinations.filter((place) => has(text, place.id)).map((place) => place.id);
  const selectedExperiences = experiences.filter((experience) => (experienceAliases[experience.id] ?? []).some((alias) => text.includes(alias)) ).map((experience) => experience.id);
  const questions = [days ? "" : "days", arrival ? "" : "arrivalAirport", departure ? "" : "departureAirport"].filter(Boolean);
  return { days: days || null, arrivalAirport: arrival?.id ?? "", departureAirport: departure?.id ?? "", destinations: selected, experiences: selectedExperiences, questions };
}
