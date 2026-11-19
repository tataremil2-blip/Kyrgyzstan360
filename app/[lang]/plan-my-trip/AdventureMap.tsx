"use client";
import { airports, destinations, type AirportId, type DestinationId } from "@/lib/planner";
type Point = { x: number; y: number };
const points: Partial<Record<AirportId | DestinationId, Point>> = {
  bishkek:{x:29,y:31}, almaty:{x:16,y:20}, tashkent:{x:12,y:77}, "ala-archa":{x:27,y:39}, burana:{x:34,y:25}, "issyk-kul":{x:54,y:30}, karakol:{x:72,y:35}, "song-kul":{x:48,y:57}, "kel-suu":{x:79,y:64}, naryn:{x:61,y:55}, "tash-rabat":{x:43,y:77}, kochkor:{x:44,y:44}, "altyn-arashan":{x:78,y:43}, jyrgalan:{x:83,y:29}, "seven-bulls":{x:65,y:43}, "cholpon-ata":{x:57,y:22}, "sary-chelek":{x:16,y:71}, osh:{x:25,y:88}, "chon-kemin":{x:44,y:20}, "chunkurchak-ski":{x:31,y:18}, "kashka-suu-ski":{x:27,y:21}, "too-ashuu":{x:30,y:54}, "sulaiman-too":{x:24,y:84}, "sary-mogol":{x:40,y:91}, "sary-tash":{x:44,y:96}, taldyk:{x:51,y:91}, arslanbob:{x:11,y:80}, "kan-i-gut":{x:8,y:75}, "manas-ordo":{x:15,y:43}, "33-parrots":{x:53,y:20}, "kalmak-ashuu":{x:74,y:21}, mels:{x:49,y:30}, tosor:{x:61,y:48}, "almaty-city":{x:16,y:20}, charyn:{x:34,y:25}, kolsai:{x:40,y:20}, kaindy:{x:42,y:26}, "big-almaty-lake":{x:22,y:27}, "tashkent-city":{x:12,y:77}, samarkand:{x:25,y:71}, bukhara:{x:17,y:54}, khiva:{x:5,y:42},
};
export default function AdventureMap({ locale, arrivalAirport, departureAirport, destinationIds, isAiDraft = false }: { locale: "ru" | "en"; arrivalAirport: AirportId | ""; departureAirport: AirportId | ""; destinationIds: DestinationId[]; isAiDraft?: boolean }) {
  const route = [arrivalAirport, ...destinationIds, departureAirport].filter(Boolean) as Array<AirportId | DestinationId>;
  const getPoint = (id: AirportId | DestinationId) => points[id] ?? { x: 50, y: 50 };
  const line = route.map((id) => { const p = getPoint(id); return `${p.x},${p.y}`; }).join(" ");
  return <section className="adventure-map" aria-label={locale === "ru" ? "Карта наброска маршрута" : "Trip route map"}>
    <div className="map-heading"><span>{locale === "ru" ? "КАРТА ПУТЕШЕСТВИЯ" : "TRIP MAP"}</span><small>{isAiDraft ? (locale === "ru" ? "Порядок из черновика ИИ" : "Order from AI draft") : (locale === "ru" ? "Схематично · не навигация" : "Schematic · not navigation")}</small></div>
    <svg viewBox="0 0 100 100" role="img" aria-label={locale === "ru" ? "Выбранные точки на схематичной карте Центральной Азии" : "Selected destinations on a schematic Central Asia map"}>
      <path className="map-land" d="M4 20 24 8 48 12 66 7 94 20 88 43 97 62 82 78 63 72 51 94 27 91 9 75 14 55Z" /><path className="map-ridge" d="M10 50 25 43 37 48 50 39 64 48 77 41 92 48M22 68 39 60 54 67 71 57 88 68" />
      {line && <polyline className="map-route" points={line} />}
      {route.map((id, index) => { const p = getPoint(id); const airport = airports.find((item) => item.id === id); const place = destinations.find((item) => item.id === id); const label = airport?.[locale] ?? place?.[locale] ?? id; return <g key={`${id}-${index}`} className="map-marker" transform={`translate(${p.x} ${p.y})`}><circle r="2.6" /><text x="4" y="-3">{index + 1}. {label}</text></g>; })}
    </svg>
    <p className="map-note">{locale === "ru" ? "Линия показывает выбранный порядок пожеланий. Реальные дороги, время в пути и доступность добавим после подключения картографического сервиса." : "The line shows your selected order. Real roads, travel times and access will be added when the mapping service is connected."}</p>
  </section>;
}
