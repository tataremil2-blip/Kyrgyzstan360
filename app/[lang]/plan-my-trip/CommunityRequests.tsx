"use client";

type CommunityRequest = { id: string; title: string; meta: string; places: string[]; text: string };

const examples: CommunityRequest[] = [
  { id: "kel-suu-yurt", title: "Кыргызстан на 8 дней", meta: "8 дней · Бишкек → Алматы", places: ["Кель-Суу", "Сон-Куль", "Каракол"], text: "Хочу шоу орлов, Кель-Суу и пожить в юрте." },
  { id: "silk-road", title: "Шёлковый путь и горные озёра", meta: "10 дней · Бишкек → Бишкек", places: ["Бурана", "Сон-Куль", "Таш-Рабат"], text: "Интересуют история, кочевая культура и красивые дороги без спешки." },
];

export default function CommunityRequests({ locale, current }: { locale: "ru" | "en"; current?: CommunityRequest | null }) {
  const ru = locale === "ru";
  const requests = current ? [current, ...examples] : examples;
  return <section className="community-requests" aria-labelledby="community-requests-title">
    <p className="planner-eyebrow">{ru ? "ИЗ ИДЕЙ ДРУГИХ ПУТЕШЕСТВЕННИКОВ" : "FROM OTHER TRAVELLERS"}</p>
    <h2 id="community-requests-title">{ru ? "Посмотрите, что планируют другие" : "See what other travellers are planning"}</h2>
    <p className="community-requests-intro">{ru ? "Открытые обезличенные запросы — источник идей для вашего маршрута. Имена и контакты здесь не публикуются." : "Public, anonymised requests can inspire your own route. Names and contact details are never shown."}</p>
    <div className="community-request-grid">{requests.map((request) => <article className="community-request-card" key={request.id}>
      <span className="community-request-meta">{request.meta}</span><h3>{request.title}</h3><p>{request.text}</p><div className="community-request-places">{request.places.map((place) => <span key={place}>{place}</span>)}</div><button type="button" onClick={() => navigator.clipboard?.writeText(request.text)}>{ru ? "Взять идею за основу" : "Use as inspiration"}</button>
    </article>)}</div>
  </section>;
}
