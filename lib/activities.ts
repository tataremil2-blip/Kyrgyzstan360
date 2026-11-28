import type { Locale } from "@/lib/i18n";

export type ActivityIcon = "mountain" | "horse" | "jeep" | "silk-road" | "camera" | "snow" | "water" | "eagle";

type LocalizedActivity = {
  title: string;
  summary: string;
  description: string;
  availabilityNote: string;
  cta: string;
  back: string;
};

export type Activity = {
  slug: string;
  icon: ActivityIcon;
  image: string;
  en: LocalizedActivity;
  ru: LocalizedActivity;
};

export const activities: Activity[] = [
  {
    slug: "mountains-hiking", icon: "mountain", image: "/individual-tour.jpg",
    en: { title: "Mountains & hiking", summary: "Mountain walks, high passes and time outside.", description: "From an easy day in the mountains to a longer walk, we can shape time outside around your pace and interests.", availabilityNote: "Places, format and availability are agreed around your trip.", cta: "Plan my trip", back: "All experiences" },
    ru: { title: "Горы и хайкинг", summary: "Горные прогулки, перевалы и время на природе.", description: "От лёгкого дня в горах до более продолжительного похода — подберём формат под ваш темп и интересы.", availabilityNote: "Конкретные места, формат и доступность согласуются при подготовке поездки.", cta: "Спланировать путешествие", back: "Все впечатления" },
  },
  {
    slug: "horse-riding-nomadic-life", icon: "horse", image: "/winter/horses.jpg",
    en: { title: "Horse riding & nomadic life", summary: "Ride with local guides and spend time close to nomadic traditions.", description: "Horse riding can be a calm introduction or part of a wider journey through mountain valleys and yurt country.", availabilityNote: "Places, format and availability are agreed around your trip.", cta: "Plan my trip", back: "All experiences" },
    ru: { title: "Верховая езда и кочевая жизнь", summary: "Конные прогулки с местными гидами и знакомство с кочевыми традициями.", description: "Конная прогулка может быть спокойным знакомством или частью более широкого путешествия по горным долинам и юрточным стоянкам.", availabilityNote: "Конкретные места, формат и доступность согласуются при подготовке поездки.", cta: "Спланировать путешествие", back: "Все впечатления" },
  },
  {
    slug: "4x4-expeditions", icon: "jeep", image: "/vehicles/land-cruiser-100-mountains.png",
    en: { title: "4×4 expeditions", summary: "Mountain roads, remote valleys and the freedom to go further.", description: "A 4×4 journey gives room for long road days, mountain passes and stops that suit your route.", availabilityNote: "Places, format and availability are agreed around your trip.", cta: "Plan my trip", back: "All experiences" },
    ru: { title: "4×4 экспедиции", summary: "Горные дороги, удалённые долины и свобода ехать дальше.", description: "Путешествие на внедорожнике даёт пространство для долгих переездов, перевалов и остановок, которые подходят именно вашему маршруту.", availabilityNote: "Конкретные места, формат и доступность согласуются при подготовке поездки.", cta: "Спланировать путешествие", back: "Все впечатления" },
  },
  {
    slug: "silk-road-culture", icon: "silk-road", image: "/guide-book-hiker-map.png",
    en: { title: "Silk Road & culture", summary: "Cities, stories and everyday Central Asia.", description: "Build time into your journey for local food, architecture, history and the people who make each place distinct.", availabilityNote: "Places, format and availability are agreed around your trip.", cta: "Plan my trip", back: "All experiences" },
    ru: { title: "Шёлковый путь и культура", summary: "Города, истории и повседневная жизнь Центральной Азии.", description: "В путешествие можно включить местную кухню, архитектуру, историю и знакомство с людьми, которые делают каждое место особенным.", availabilityNote: "Конкретные места, формат и доступность согласуются при подготовке поездки.", cta: "Спланировать путешествие", back: "Все впечатления" },
  },
  {
    slug: "nature-photography", icon: "camera", image: "/hero-kyrgyzstan.jpg",
    en: { title: "Nature & photography", summary: "Make time for the landscapes that stay with you.", description: "Slow the journey down for mountain light, lakes, open roads and the moments you want to take home.", availabilityNote: "Places, format and availability are agreed around your trip.", cta: "Plan my trip", back: "All experiences" },
    ru: { title: "Природа и фотография", summary: "Время для пейзажей, которые остаются с вами.", description: "Можно замедлить путешествие ради горного света, озёр, открытых дорог и тех моментов, которые хочется увезти с собой.", availabilityNote: "Конкретные места, формат и доступность согласуются при подготовке поездки.", cta: "Спланировать путешествие", back: "Все впечатления" },
  },
  {
    slug: "skiing-freeride", icon: "snow", image: "/winter/skiers-descent.webp",
    en: { title: "Skiing & freeride", summary: "Snow, mountains and local winter knowledge.", description: "For winter travellers, we can discuss a format that matches experience, conditions and the kind of mountain day you want.", availabilityNote: "Places, format and availability are agreed around your trip.", cta: "Plan my trip", back: "All experiences" },
    ru: { title: "Лыжи и фрирайд", summary: "Снег, горы и местное знание зимних маршрутов.", description: "Для зимнего путешествия обсудим формат, который подходит вашему опыту, условиям и тому, каким вы видите день в горах.", availabilityNote: "Конкретные места, формат и доступность согласуются при подготовке поездки.", cta: "Спланировать путешествие", back: "Все впечатления" },
  },
  {
    slug: "water-adventures", icon: "water", image: "/rent-service-camp.jpg",
    en: { title: "Water adventures", summary: "Jet surfing, eFoil riding, boat trips and jet skis.", description: "Add a water day to a wider journey when the place, season and local conditions are right.", availabilityNote: "Places, format and availability are agreed around your trip.", cta: "Plan my trip", back: "All experiences" },
    ru: { title: "Водные приключения", summary: "Джетсёрф, eFoil, прогулки на катере и гидроциклы.", description: "Водный день можно добавить к путешествию, если место, сезон и местные условия для этого подходят.", availabilityNote: "Конкретные места, формат и доступность согласуются при подготовке поездки.", cta: "Спланировать путешествие", back: "Все впечатления" },
  },
  {
    slug: "eagle-hunting-traditions", icon: "eagle", image: "/winter/eagles.jpg",
    en: { title: "Eagle hunting traditions", summary: "Meet local eagle hunters and discover Kyrgyz eagle-hunting traditions.", description: "Learn about a living tradition through a respectful local introduction arranged around your route.", availabilityNote: "Places, format and availability are agreed around your trip.", cta: "Plan my trip", back: "All experiences" },
    ru: { title: "Традиции беркутчи", summary: "Знакомство с беркутчи и традицией охоты с беркутом.", description: "Познакомьтесь с живой традицией через уважительное общение с местными беркутчи, организованное в рамках вашего маршрута.", availabilityNote: "Конкретные места, формат и доступность согласуются при подготовке поездки.", cta: "Спланировать путешествие", back: "Все впечатления" },
  },
];

export function getActivity(slug: string) {
  return activities.find((activity) => activity.slug === slug);
}

export function activityContent(activity: Activity, locale: Locale) {
  return activity[locale];
}
