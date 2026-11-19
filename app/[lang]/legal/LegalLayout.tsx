import { getTranslator } from "@/lib/server-translations";
import { LocalizedAnchor } from "@/app/LocalizedLink";
import Link from "@/app/LocalizedLink";
import { ReactNode } from "react";
import "./legal.css";

export default async function LegalLayout({ eyebrow, title, accent, intro, children }: { eyebrow: string; title: string; accent: string; intro: string; children: ReactNode }) {
  const translate = await getTranslator();
  return <main className="legal-page"><header className="legal-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link href="/">{translate("← BACK TO HOME")}</Link></header><section className="legal-intro"><p>{translate(eyebrow)}</p><h1>{translate(title)}<br />{translate(accent)}</h1><span>{translate(intro)}</span></section><nav className="legal-nav" aria-label={translate("Legal documents")}><Link href="/legal#operator">{translate("01 · LEGAL INFORMATION")}</Link><Link href="/terms">{translate("02 · TERMS & CONDITIONS")}</Link><Link href="/privacy">{translate("03 · PRIVACY POLICY")}</Link><Link href="/cookies">{translate("04 · COOKIE POLICY")}</Link></nav>{translate(children)}<section className="legal-contact"><p>{translate("KYRGYZSTAN360")}</p><h2>{translate("Emil Zakirov")}</h2><address>{translate("147 Imanaly Aidarbekov str.")}<br />{translate("Bishkek, Kyrgyzstan")}<br />720014</address><LocalizedAnchor href="mailto:tataremil2@gmail.com">{translate("tataremil2@gmail.com")}</LocalizedAnchor><LocalizedAnchor href="https://wa.me/996557444225" target="_blank" rel="noreferrer">{translate("WhatsApp: +996 557 444 225")}</LocalizedAnchor><span>{translate("kyrgyzstan360.com")}</span></section></main>;
}
