const RESEND_API_URL = "https://api.resend.com";

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_AUDIENCE_ID?.trim());
}

export function isResendEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Resend is not configured (RESEND_API_KEY)");
  }

  const from = options.from ?? process.env.RESEND_FROM_EMAIL?.trim() ?? "Saily <onboarding@resend.dev>";

  const response = await fetch(`${RESEND_API_URL}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Resend send failed (${response.status}): ${errorText}`);
  }

  return { ok: true, status: response.status };
}

export async function upsertResendContact(email: string, options: { unsubscribed?: boolean } = {}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();

  if (!apiKey || !audienceId) {
    throw new Error("Resend is not configured (RESEND_API_KEY / RESEND_AUDIENCE_ID)");
  }

  const response = await fetch(`${RESEND_API_URL}/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, unsubscribed: options.unsubscribed ?? false }),
    cache: "no-store",
  });

  // Resend returns 409 if the contact already exists in the audience - treat as success.
  if (response.ok || response.status === 409) {
    return { ok: true, status: response.status };
  }

  const errorText = await response.text().catch(() => "");
  throw new Error(`Resend contact upsert failed (${response.status}): ${errorText}`);
}
