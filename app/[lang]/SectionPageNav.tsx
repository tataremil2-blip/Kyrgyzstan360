import { getTranslator } from "@/lib/server-translations";
import { LocalizedAnchor } from "@/app/LocalizedLink";
import "./section-page-nav.css";

export default async function SectionPageNav({ items, label = "Page sections" }: { items: Array<{ href: string; label: string }>; label?: string }) {
  const translate = await getTranslator();
  return <nav className="section-page-nav" aria-label={translate(label)}>{translate(items.map((item) => <LocalizedAnchor href={item.href} key={item.href}>{translate(item.label)}</LocalizedAnchor>))}</nav>;
}
