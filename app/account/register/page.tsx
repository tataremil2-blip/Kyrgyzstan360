import Link from "next/link";
import { registerTraveler } from "../actions";

export default async function AccountRegister({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <section className="account-auth"><h1>Create your free account</h1><p className="account-muted">Track your request and keep your trip details in one place.</p>
    {params.error && <p className="account-alert" role="alert">Please use a valid email and a password with at least 12 characters.</p>}
    <form action={registerTraveler}><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label><button>Create account</button></form>
    <p>Already have an account? <Link href="/account/login">Sign in</Link></p></section>;
}
