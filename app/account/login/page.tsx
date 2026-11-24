import Link from "next/link";
import { loginTraveler } from "../actions";

export default async function AccountLogin({ searchParams }: { searchParams: Promise<{ error?: string; checkEmail?: string }> }) {
  const params = await searchParams;
  return <section className="account-auth"><p className="account-eyebrow">KYRGYZSTAN360 · TRAVELER ACCOUNT</p><h1>Welcome back</h1><p className="account-muted">Continue planning your Central Asia adventure.</p>
    {params.error && <p className="account-alert" role="alert">Unable to sign in. Check your email and password.</p>}
    {params.checkEmail && <p role="status">Check your email to confirm your account, then sign in.</p>}
    <form action={loginTraveler}><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button>Sign in</button></form>
    <p>New here? <Link href="/account/register">Create a free account</Link></p><p><Link href="/en">Back to Kyrgyzstan360</Link></p></section>;
}
