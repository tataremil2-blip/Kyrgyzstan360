import Image from "next/image";
import { notFound } from "next/navigation";
import { LocalizedAnchor } from "@/app/LocalizedLink";
import { activityContent, getActivity } from "@/lib/activities";
import { isLocale } from "@/lib/i18n";
import "./experience.css";

export default async function ExperiencePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const activity = getActivity(slug);
  if (!activity) notFound();
  const copy = activityContent(activity, lang);

  return <main className="experience-page">
    <section className="experience-hero">
      <Image src={activity.image} alt="" fill priority sizes="100vw" />
      <div>
        <LocalizedAnchor href="/#styles">← {copy.back}</LocalizedAnchor>
        <p>{lang === "ru" ? "ВПЕЧАТЛЕНИЯ" : "EXPERIENCES"}</p>
        <h1>{copy.title}</h1>
      </div>
    </section>
    <section className="experience-copy">
      <p className="experience-lead">{copy.description}</p>
      <p>{copy.availabilityNote}</p>
      <LocalizedAnchor className="experience-cta" href="/plan-your-trip">{copy.cta} →</LocalizedAnchor>
    </section>
  </main>;
}
