export type JourneySeason = "summer" | "winter";

export type Journey = {
  slug: string;
  title: string;
  season: JourneySeason;
  coverImage: string;
  galleryImages: string[];
  duration?: string;
  countries?: string[];
  locations?: string[];
  story?: string;
  route?: string[];
  review?: string;
  reviewerName?: string;
  instagramReelUrl?: string;
  featured?: boolean;
};

const imageSet = ["/individual-tour.jpg", "/hero-kyrgyzstan.jpg", "/rent-service-camp.jpg", "/guide-book-hiker-map.png"];

export const journeys: Journey[] = [
  { slug: "25-days-central-asia", title: "25 DAYS ACROSS CENTRAL ASIA", season: "summer", coverImage: "/hero-kyrgyzstan.jpg", galleryImages: imageSet, duration: "25 days", countries: ["Kazakhstan", "Kyrgyzstan", "Uzbekistan", "Tajikistan"], route: ["Kazakhstan", "Kyrgyzstan", "Uzbekistan", "Tajikistan"], featured: true },
  { slug: "12-days-kyrgyzstan", title: "12 DAYS ACROSS KYRGYZSTAN", season: "summer", coverImage: "/individual-tour.jpg", galleryImages: ["/individual-tour.jpg", "/hero-kyrgyzstan.jpg", "/rent-service-camp.jpg"], duration: "12 days", countries: ["Kyrgyzstan"], route: ["Bishkek", "Song-Kul", "Issyk-Kul"], featured: true },
  { slug: "birthday-in-kyrgyzstan", title: "A BIRTHDAY IN KYRGYZSTAN", season: "summer", coverImage: "/rent-service-camp.jpg", galleryImages: ["/rent-service-camp.jpg", "/hero-kyrgyzstan.jpg"], countries: ["Kyrgyzstan"], featured: true },
  { slug: "colors-and-traditions", title: "COLORS & TRADITIONS OF KYRGYZSTAN", season: "summer", coverImage: "/guide-book-hiker-map.png", galleryImages: ["/guide-book-hiker-map.png", "/hero-kyrgyzstan.jpg"], countries: ["Kyrgyzstan"], featured: true },
  { slug: "private-adventure-with-friends", title: "A PRIVATE ADVENTURE WITH FRIENDS", season: "summer", coverImage: "/group-tour.jpg", galleryImages: ["/group-tour.jpg", "/hero-kyrgyzstan.jpg"], countries: ["Kyrgyzstan"], featured: true },
  { slug: "4x4-adventure-with-friends", title: "4×4 ADVENTURE WITH FRIENDS", season: "summer", coverImage: "/rent-service-camp.jpg", galleryImages: ["/rent-service-camp.jpg", "/individual-tour.jpg"], countries: ["Kyrgyzstan"], featured: true },
  { slug: "summer-festival-adventure", title: "SUMMER FESTIVAL ADVENTURE", season: "summer", coverImage: "/winter-promo-freeride.png", galleryImages: ["/winter-promo-freeride.png", "/hero-kyrgyzstan.jpg"], countries: ["Kyrgyzstan"] },
  { slug: "freeride-in-jyrgalan", title: "FREERIDE IN JYRGALAN", season: "winter", coverImage: "/winter-freeride-snowcat.png", galleryImages: ["/winter-freeride-snowcat.png", "/winter-promo-freeride.png"], countries: ["Kyrgyzstan"], locations: ["Jyrgalan"], featured: true },
  { slug: "winter-adventures-kyrgyzstan", title: "WINTER ADVENTURES IN KYRGYZSTAN", season: "winter", coverImage: "/winter-promo-freeride.png", galleryImages: ["/winter-promo-freeride.png", "/winter-freeride-snowcat.png"], countries: ["Kyrgyzstan"], featured: true },
  { slug: "fwtq-kyrgyzstan", title: "FWTQ KYRGYZSTAN", season: "winter", coverImage: "/winter-freeride-snowcat.png", galleryImages: ["/winter-freeride-snowcat.png", "/winter-promo-freeride.png"], countries: ["Kyrgyzstan"], featured: true },
];

export function getJourney(slug: string) { return journeys.find((journey) => journey.slug === slug); }
