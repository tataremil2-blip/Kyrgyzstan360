"use client";
import { setPassword } from "../actions";
export default function PasswordForm({ next }: { next: string }) {
  return <form action={setPassword}>
    <input type="hidden" name="next" value={next} />
    <label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
    <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
    <button type="submit">Set password</button>
  </form>;
}

