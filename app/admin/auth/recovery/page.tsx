import Link from "next/link";
import { sendRecovery } from "./actions";
export default async function Recovery({ searchParams }: PageProps<"/admin/auth/recovery">) {
  const params = await searchParams;
  return <section className="crm-login"><h1>Reset your password</h1>
    {params.sent ? <p>If the account is eligible, a recovery email will arrive shortly.</p> :
      <form action={sendRecovery}><label>Email<input type="email" name="email" autoComplete="email" required /></label><button>Send recovery link</button></form>}
    {params.error && <p role="alert">Enter a valid email address.</p>}<Link href="/admin/login">Back to sign in</Link>
  </section>;
}
