"use client";

import { deleteTravelerRequest } from "./actions";

export default function DeleteRequestButton({ id }: { id: string }) {
  return <form action={deleteTravelerRequest.bind(null, id)} onSubmit={(event) => { if (!window.confirm("Delete this travel request? This cannot be undone.")) event.preventDefault(); }}><button className="account-danger" type="submit">Delete request</button></form>;
}
