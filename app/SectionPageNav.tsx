import "./section-page-nav.css";

export default function SectionPageNav({ items, label = "Page sections" }: { items: Array<{ href: string; label: string }>; label?: string }) {
  return <nav className="section-page-nav" aria-label={label}>{items.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>;
}
