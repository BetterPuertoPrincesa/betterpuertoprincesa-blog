// Server actions return errors as values instead of throwing. In
// production, Next.js hides the message of anything thrown from a server
// action (the browser only sees "Minified React error #441"), which left
// editors with no idea what went wrong.

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string };

/** Client side: turn a failed result back into a normal thrown Error. */
export async function unwrap<T>(result: Promise<ActionResult<T>>) {
  const r = await result;
  if (!r.ok) throw new Error(r.error);
  return r.data;
}
