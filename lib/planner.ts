export const countries = [
  { id: "kg", ru: "Кыргызстан", en: "Kyrgyzstan" },
  { id: "kz", ru: "Казахстан", en: "Kazakhstan" },
  { id: "uz", ru: "Узбекистан", en: "Uzbekistan" },
] as const;
export const airports = [
  { id: "bishkek", country: "kg", ru: "Бишкек — аэропорт Манас", en: "Bishkek — Manas Airport" },
  { id: "almaty", country: "kz", ru: "Алматы — аэропорт Алматы", en: "Almaty Airport" },
  { id: "tashkent", country: "uz", ru: "Ташкент — аэропорт Ташкента", en: "Tashkent Airport" },
] as const;
export type CountryId = typeof countries[number]["id"];
export type AirportId = typeof airports[number]["id"];

// Concept estimates from the approved prototype, not verified travel times.
export const destinations = [
  { id: "issyk-kul", en: "Issyk-Kul", ru: "Иссык-Куль", days: 2, country: "kg" },
  { id: "karakol", en: "Karakol", ru: "Каракол", days: 2, country: "kg" },
  { id: "song-kul", en: "Song-Kul", ru: "Сон-Куль", days: 2, country: "kg" },
  { id: "engilchek", en: "Engilchek Glacier", ru: "Ледник Энилчек", days: 3, country: "kg" },
  { id: "kel-suu", en: "Kel-Suu", ru: "Кель-Суу", days: 2, country: "kg" },
  { id: "tash-rabat", en: "Tash-Rabat", ru: "Таш-Рабат", days: 1, country: "kg" },
  { id: "chon-kemin", en: "Chon-Kemin", ru: "Чон-Кемин", days: 1, country: "kg" },
  { id: "osh", en: "Osh", ru: "Ош", days: 2, country: "kg" },
  { id: "altyn-arashan", en: "Altyn-Arashan", ru: "Алтын-Арашан", days: 1, country: "kg" },
  {"id": "bishkek", "en": "Bishkek", "ru": "Бишкек", "days": null, "country": "kg"},
  {"id": "ala-archa", "en": "Ala-Archa", "ru": "Ала-Арча", "days": null, "country": "kg"},
  {"id": "burana", "en": "Burana Tower", "ru": "Башня Бурана", "days": null, "country": "kg"},
  {"id": "naryn", "en": "Naryn", "ru": "Нарын", "days": null, "country": "kg"},
  {"id": "kochkor", "en": "Kochkor", "ru": "Кочкор", "days": null, "country": "kg"},
  {"id": "jyrgalan", "en": "Jyrgalan", "ru": "Жыргалан", "days": null, "country": "kg"},
  {"id": "seven-bulls", "en": "Seven Bulls", "ru": "Семь Быков", "days": null, "country": "kg"},
  {"id": "cholpon-ata", "en": "Cholpon-Ata", "ru": "Чолпон-Ата", "days": null, "country": "kg"},
  {"id": "sary-chelek", "en": "Sary-Chelek", "ru": "Сары-Челек", "days": null, "country": "kg"},
  {"id": "chunkurchak-ski", "en": "Chunkurchak Ski Resort", "ru": "Горнолыжная база Чункурчак", "days": null, "country": "kg"},
  {"id": "kashka-suu-ski", "en": "Kashka-Suu Ski Resort", "ru": "Горнолыжная база Кашка-Суу", "days": null, "country": "kg"},
  {"id": "too-ashuu", "en": "Too-Ashuu Pass", "ru": "Перевал Төө-Ашуу", "days": null, "country": "kg"},
  {"id": "sulaiman-too", "en": "Sulaiman-Too", "ru": "Сулайман-Тоо", "days": null, "country": "kg"},
  {"id": "sary-mogol", "en": "Sary-Mogol", "ru": "Сары-Могол", "days": null, "country": "kg"},
  {"id": "sary-tash", "en": "Sary-Tash", "ru": "Сары-Таш", "days": null, "country": "kg"},
  {"id": "taldyk", "en": "Taldyk Pass", "ru": "Перевал Талдык", "days": null, "country": "kg"},
  {"id": "arslanbob", "en": "Arslanbob", "ru": "Арстанбап", "days": null, "country": "kg"},
  {"id": "kan-i-gut", "en": "Kan-i-Gut", "ru": "Кан-и-Гут", "days": null, "country": "kg"},
  {"id": "manas-ordo", "en": "Manas Ordo", "ru": "Манас Ордо", "days": null, "country": "kg"},
  {"id": "33-parrots", "en": "33 Parrots Pass", "ru": "Перевал 33 попугая", "days": null, "country": "kg"},
  {"id": "kalmak-ashuu", "en": "Kalmak-Ashuu Pass", "ru": "Перевал Калмак-Ашуу", "days": null, "country": "kg"},
  {"id": "mels", "en": "MELS Pass", "ru": "Перевал МЭЛС", "days": null, "country": "kg"},
  {"id": "tosor", "en": "Tosor Pass", "ru": "Перевал Тосор", "days": null, "country": "kg"},
  {"id": "almaty-city", "en": "Almaty", "ru": "Алматы", "days": null, "country": "kz"},
  {"id": "charyn", "en": "Charyn Canyon", "ru": "Чарынский каньон", "days": null, "country": "kz"},
  {"id": "kolsai", "en": "Kolsai Lakes", "ru": "Кольсайские озёра", "days": null, "country": "kz"},
  {"id": "kaindy", "en": "Lake Kaindy", "ru": "Озеро Каинды", "days": null, "country": "kz"},
  {"id": "big-almaty-lake", "en": "Big Almaty Lake", "ru": "Большое Алматинское озеро", "days": null, "country": "kz"},
  {"id": "tashkent-city", "en": "Tashkent", "ru": "Ташкент", "days": null, "country": "uz"},
  {"id": "samarkand", "en": "Samarkand", "ru": "Самарканд", "days": null, "country": "uz"},
  {"id": "bukhara", "en": "Bukhara", "ru": "Бухара", "days": null, "country": "uz"},
  {"id": "khiva", "en": "Khiva", "ru": "Хива", "days": null, "country": "uz"},
] as const;
export const experiences = [
  { id: "jeep", en: "4×4 Adventure", ru: "Приключение на 4×4" },
  { id: "horses", en: "Horse Riding", ru: "Конные прогулки" },
  { id: "hiking", en: "Hiking", ru: "Походы в горы" },
  { id: "yurts", en: "Yurt Camping", ru: "Ночёвки в юртах" },
  { id: "eagles", en: "Eagle Hunting Show", ru: "Встреча с беркутчи" },
  { id: "springs", en: "Hot Springs", ru: "Горячие источники" },
  { id: "winter", en: "Freeride & Skiing", ru: "Фрирайд и лыжи" },
  { id: "culture", en: "Cultural Tours", ru: "Культура и традиции" },
] as const;
export type DestinationId = typeof destinations[number]["id"];
export type ExperienceId = typeof experiences[number]["id"];
export function suggestedDays(ids: readonly string[]) {
  return destinations.filter((place) => ids.includes(place.id)).reduce((sum, place) => sum + (place.days ?? 0), 0);
}

import catalog from "../data/routes/catalog.json";


export const plannerStorageKey = "kyrgyzstan360-trip-draft-v1";
export const interests = ["mountains", "lakes", "culture", "horses", "winter"] as const;
export type Interest = (typeof interests)[number];
export type TripDraft = {
  version: 1;
  freeText: string;
  aiItinerary: Array<{ day: number; title: string; placeId: string; activities: string[]; overnightPlaceId: string | null }>;
  arrivalAirport: AirportId | "";
  departureAirport: AirportId | "";
  countries: CountryId[];
  month: string;
  startDate: string;
  endDate: string;
  days: 6 | 8 | 12;
  guests: number;
  budget: string;
  interests: Interest[];
  pace: "relaxed" | "balanced" | "active";
  transport: "driver" | "selfdrive" | "discuss";
  comfort: "mixed" | "hotels" | "camping";
  showResult: boolean;
  destinations: DestinationId[];
  experiences: ExperienceId[];
};
export const defaultTripDraft: TripDraft = { version: 1, freeText: "", aiItinerary: [], arrivalAirport: "", departureAirport: "", countries: ["kg"], month: "", startDate: "", endDate: "", days: 8, guests: 2, budget: "", interests: ["mountains", "lakes"], pace: "balanced", transport: "driver", comfort: "mixed", showResult: false, destinations: ["issyk-kul", "kel-suu", "altyn-arashan"], experiences: ["jeep", "hiking"] };
export function parseTripDraft(raw: string | null): TripDraft {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || value.version !== 1) return { ...defaultTripDraft };
    return {
      version: 1,
      freeText: typeof value.freeText === "string" ? value.freeText.slice(0, 4000) : "",
      aiItinerary: Array.isArray(value.aiItinerary) ? value.aiItinerary.filter((item: unknown) => Boolean(item && typeof item === "object" && typeof (item as { day?: unknown }).day === "number" && typeof (item as { title?: unknown }).title === "string" && typeof (item as { placeId?: unknown }).placeId === "string" && Array.isArray((item as { activities?: unknown }).activities))).slice(0, 31) : [],
      arrivalAirport: airports.some((item) => item.id === value.arrivalAirport) ? value.arrivalAirport : "",
      departureAirport: airports.some((item) => item.id === value.departureAirport) ? value.departureAirport : "",
      countries: Array.isArray(value.countries) ? countries.filter((item) => value.countries.includes(item.id)).map((item) => item.id) : ["kg"],
      destinations: Array.isArray(value.destinations) ? destinations.filter((item) => value.destinations.includes(item.id) && (!Array.isArray(value.countries) || value.countries.includes(item.country))).map((item) => item.id) : (!Array.isArray(value.countries) || value.countries.includes("kg") ? [...defaultTripDraft.destinations] : []),
      experiences: Array.isArray(value.experiences) ? experiences.filter((item) => value.experiences.includes(item.id)).map((item) => item.id) : [...defaultTripDraft.experiences],
      month: typeof value.month === "string" && /^20\d{2}-(0[1-9]|1[0-2])$/.test(value.month) ? value.month : "",
      startDate: typeof value.startDate === "string" && /^20\d{2}-\d{2}-\d{2}$/.test(value.startDate) ? value.startDate : "",
      endDate: typeof value.endDate === "string" && /^20\d{2}-\d{2}-\d{2}$/.test(value.endDate) ? value.endDate : "",
      days: [6, 8, 12].includes(value.days) ? value.days : 8,
      guests: Number.isInteger(value.guests) && value.guests >= 1 && value.guests <= 16 ? value.guests : 2,
      budget: typeof value.budget === "string" ? ({ undecided: "", under1500: "1500", "1500to2500": "2000", over2500: "2500" }[value.budget] ?? value.budget.slice(0, 24)) : "",
      interests: Array.isArray(value.interests) ? interests.filter((item) => value.interests.includes(item)) : [...defaultTripDraft.interests],
      pace: ["relaxed", "balanced", "active"].includes(value.pace) ? value.pace : "balanced",
      transport: ["driver", "selfdrive", "discuss"].includes(value.transport) ? value.transport : "driver",
      comfort: ["mixed", "hotels", "camping"].includes(value.comfort) ? value.comfort : "mixed",
      showResult: value.showResult === true,
    };
  } catch { return { ...defaultTripDraft }; }
}

type Bilingual = { en: string; ru: string };
export type ExampleDay = { title: Bilingual; description: Bilingual; stay: Bilingual };
function catalogExample(routeId: string): ExampleDay[] {
  const source = catalog.routes.find((item) => item.id === routeId);
  if (!source) throw new Error(`Missing sample route: ${routeId}`);
  return source.days.map((day) => ({
    title: day.title,
    description: day.description,
    stay: day.overnightLabel ?? catalog.places.find((place) => place.id === day.overnightPlaceId)?.name ?? { en: "To be confirmed / departure", ru: "Уточняется / отъезд" },
  }));
}
const route = catalogExample("private-6");
// A deterministic preview, not an AI-generated or availability-checked itinerary.
export function exampleItinerary(days: TripDraft["days"]): ExampleDay[] {
  if (days === 8) return catalogExample("group-8");
  const result: ExampleDay[] = [];
  let extra = days - route.length;
  route.forEach((day, index) => {
    result.push(day);
    const count = index === 0 && days === 12 ? 2 : index < 5 && extra > 0 ? 1 : 0;
    for (let i = 0; i < count && extra > 0; i++, extra--) {
      result.push({ title: day.stay, stay: day.stay, description: { en: "An extra day in the area. Walks, rest and local experiences will be selected together with you.", ru: "Дополнительный день в этом районе. Прогулки, отдых и местные занятия подберём вместе с вами." } });
    }
  });
  return result;
}

export const plannerCopy = {
  en: {
    back: "All adventures", eyebrow: "YOUR KYRGYZSTAN, YOUR WAY", title: "Every great trip", accent: "starts with you.", intro: "Tell us what you love. Explore an example route, then shape the real journey with a local.",
    details: "The essentials", detailsHint: "A few details to start with. You can change everything later.", month: "When would you like to travel?", flexible: "Dates are flexible", days: "Time on the road", dayUnit: "days", guests: "Travellers", budget: "Budget per person, USD", budgetHint: "For the trip on the ground, excluding international flights. This is your preference, not a quote.",
    preferences: "Make it your own", interests: "What brings you here?", interestHint: "Choose one or more.", mountains: "Mountains & hiking", lakes: "Lakes & landscapes", culture: "Culture & local life", horses: "Horseback riding", winter: "Winter & freeride", pace: "Your pace", relaxed: "Slow & easy", balanced: "A little of everything", active: "More adventure", transport: "How you travel", driver: "With a local driver", selfdrive: "Drive a rented 4×4", discuss: "Help me choose", comfort: "Where you stay", mixed: "Guesthouses & yurts", hotels: "Comfortable hotels", camping: "More camping", undecided: "Help me estimate", under1500: "Under $1,500", '1500to2500': "$1,500–2,500", over2500: "Over $2,500",
    preview: "See an example route", validation: "Please select at least one interest.", reset: "Clear my choices", saved: "Your choices stay in this browser when local storage is available, including when you switch languages.", resetDone: "Your choices have been reset.",
    emptyTitle: "A journey with room for you.", emptyText: "High lakes, mountain roads, local stories. Start with your preferences and see how a day-by-day programme could look.", emptyTag: "DESIGNED AROUND YOUR CURIOSITY", imageAlt: "A jeep journey through the mountains of Kyrgyzstan",
    resultTag: "EXAMPLE PROGRAMME", resultTitle: "Your journey starts to take shape.", exampleNotice: "This is a sample high-lake route, not an AI-generated plan or a booking. It reflects the selected length; dates, interests, budget, road access and accommodation still need a personal review.", winterNotice: "For winter travel, we will propose a different route. High-lake access is seasonal; this example is not a winter itinerary.", selected: "Your preferences", day: "Day", overnight: "Area for the night", edit: "Change my choices", estimate: "Final price on request", estimateText: "We will confirm the route, services, availability and cost before you book.", inquiry: "Let's plan the real trip", inquiryText: "Leave your contacts. Your preferences and the example route will be included in the request.", send: "Discuss my trip", close: "Close trip inquiry", note: "No payment or booking is made at this stage.",
    clearConfirm: "Clear the saved choices?", confirmClear: "Clear", cancel: "Keep my choices", months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
  ru: {
    back: "Все путешествия", eyebrow: "ВАШ КЫРГЫЗСТАН — ВАШ ВЫБОР", title: "Хорошая поездка", accent: "начинается с вас.", intro: "Расскажите, что вам интересно. Посмотрите пример маршрута и создайте настоящее путешествие вместе с местным гидом.",
    details: "Главное о поездке", detailsHint: "Несколько деталей для начала. Позже всё можно изменить.", month: "Когда хотите поехать?", flexible: "Даты пока не определены", days: "Время в пути", dayUnit: "дней", guests: "Путешественники", budget: "Бюджет на человека, USD", budgetHint: "На поездку без международных перелётов. Это ваше пожелание, а не расчёт стоимости.",
    preferences: "По вашим правилам", interests: "Что вам интересно?", interestHint: "Выберите один или несколько вариантов.", mountains: "Горы и походы", lakes: "Озёра и пейзажи", culture: "Культура и местная жизнь", horses: "Конные прогулки", winter: "Зима и фрирайд", pace: "Темп путешествия", relaxed: "Спокойно и неспешно", balanced: "Всего понемногу", active: "Больше приключений", transport: "Как передвигаться", driver: "С местным водителем", selfdrive: "За рулём арендованного 4×4", discuss: "Помогите выбрать", comfort: "Где останавливаться", mixed: "Гостевые дома и юрты", hotels: "Комфортабельные отели", camping: "Больше палаточных ночёвок", undecided: "Помогите оценить", under1500: "До 1 500 $", '1500to2500': "1 500–2 500 $", over2500: "Более 2 500 $",
    preview: "Посмотреть пример маршрута", validation: "Выберите хотя бы один интерес.", reset: "Сбросить выбор", saved: "Если доступно локальное хранение, пожелания сохраняются в этом браузере, в том числе при смене языка.", resetDone: "Ваши пожелания сброшены.",
    emptyTitle: "Путешествие, в котором есть место вам.", emptyText: "Горные озёра, дороги и местные истории. Начните с пожеланий и посмотрите, как может выглядеть программа по дням.", emptyTag: "НАЧНИТЕ С ЛЮБОПЫТСТВА", imageAlt: "Путешествие на внедорожнике по горам Кыргызстана",
    resultTag: "ПРИМЕР ПРОГРАММЫ", resultTitle: "Поездка обретает форму.", exampleNotice: "Это пример маршрута к горным озёрам, а не программа от ИИ и не бронирование. Он учитывает выбранную длительность; даты, интересы, бюджет, доступность дорог и проживание нужно обсудить отдельно.", winterNotice: "Для зимней поездки предложим другой маршрут. Доступ к горным озёрам зависит от сезона; этот пример не является зимней программой.", selected: "Ваши пожелания", day: "День", overnight: "Район ночёвки", edit: "Изменить пожелания", estimate: "Итоговая стоимость — по запросу", estimateText: "До бронирования подтвердим маршрут, услуги, наличие мест и цену.", inquiry: "Спланируем настоящую поездку", inquiryText: "Оставьте контакты. В заявку войдут ваши пожелания и пример маршрута.", send: "Обсудить мою поездку", close: "Закрыть заявку на поездку", note: "На этом этапе нет оплаты или бронирования.",
    clearConfirm: "Сбросить сохранённые пожелания?", confirmClear: "Сбросить", cancel: "Оставить пожелания", months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  },
};
