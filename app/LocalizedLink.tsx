"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizedHref } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export default function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const { locale } = useLocale();
  const target = typeof href === "string" ? localizedHref(href, locale) : { ...href, pathname: href.pathname ? localizedHref(href.pathname, locale) : href.pathname };
  return <Link {...props} href={target} />;
}

export function LocalizedAnchor({ href, ...props }: ComponentProps<"a">) {
  const { locale } = useLocale();
  return <a {...props} href={href ? localizedHref(href, locale) : href} />;
}
