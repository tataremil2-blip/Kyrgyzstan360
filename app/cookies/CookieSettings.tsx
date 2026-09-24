"use client";

import { useRouter } from "next/navigation";

export default function CookieSettings() {
  const router = useRouter();
  function resetConsent() { localStorage.removeItem("kyrgyzstan360-cookie-consent"); router.push("/"); }
  return <div className="cookie-settings"><h2>Change your choice</h2><p>You can revoke your consent at any time. Resetting it will return you to the home page, where the banner will appear again.</p><button type="button" onClick={resetConsent}>RESET COOKIE CHOICE</button></div>;
}
