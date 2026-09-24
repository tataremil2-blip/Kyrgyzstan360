import Link from "next/link";
import { ReactNode } from "react";
import "./legal.css";

export default function LegalLayout({ eyebrow, title, accent, intro, children }: { eyebrow: string; title: string; accent: string; intro: string; children: ReactNode }) {
  return <main className="legal-page"><header className="legal-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link href="/">← BACK TO HOME</Link></header><section className="legal-intro"><p>{eyebrow}</p><h1>{title}<br /><em>{accent}</em></h1><span>{intro}</span></section><nav className="legal-nav" aria-label="Legal documents"><Link href="/legal#operator">01 · LEGAL INFORMATION</Link><Link href="/terms">02 · TERMS &amp; CONDITIONS</Link><Link href="/privacy">03 · PRIVACY POLICY</Link><Link href="/cookies">04 · COOKIE POLICY</Link></nav>{children}<section className="legal-contact"><p>KYRGYZSTAN360</p><h2>Emil Zakirov</h2><address>147 Imanaly Aidarbekov str.<br />Bishkek, Kyrgyzstan<br />720014</address><a href="mailto:tataremil2@gmail.com">tataremil2@gmail.com</a><a href="https://wa.me/996557444225" target="_blank" rel="noreferrer">WhatsApp: +996 557 444 225</a><span>kyrgyzstan360.com</span></section></main>;
}
