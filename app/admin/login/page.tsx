import { login } from "../actions";
import Link from "next/link";

export default async function Login({ searchParams }: PageProps<"/admin/login">) {
  const { error, authError } = await searchParams;
  return <section className="crm-login">
    <h1>Staff sign in</h1>
    {error && <p role="alert">Unable to sign in. Check your credentials and staff access.</p>}
    {authError && <p role="alert">This access link is invalid or has expired. Request a new one to continue.</p>}
    <Link href="/admin/auth/recovery">Forgot password?</Link>
    <form action={login}>
      <label>Email<input type="email" name="email" autoComplete="username" required /></label>
      <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
      <button>Sign in</button>
    </form>
  </section>;
}
