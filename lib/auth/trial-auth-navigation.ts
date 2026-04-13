/**
 * Email OTP: POST to this app’s API (visible in Network as fetch to localhost).
 * OAuth uses `<a href="/api/auth/oauth/...">` in AuthPrompt — no JS required.
 */

export async function postEmailOtpSend(email: string): Promise<{
  ok: boolean;
  userId?: string;
  error?: string;
}> {
  const url =
    typeof window !== "undefined"
      ? new URL("/api/auth/email/send", window.location.origin).toString()
      : "/api/auth/email/send";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    userId?: string;
  };
  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? `Request failed (${res.status})`,
    };
  }
  return { ok: true, userId: data.userId };
}

export async function postEmailOtpVerify(
  userId: string,
  secret: string
): Promise<{ ok: boolean; error?: string }> {
  const url =
    typeof window !== "undefined"
      ? new URL("/api/auth/email/verify", window.location.origin).toString()
      : "/api/auth/email/verify";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, secret }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? `Request failed (${res.status})`,
    };
  }
  return { ok: true };
}
