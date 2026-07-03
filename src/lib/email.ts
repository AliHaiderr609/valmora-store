import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from =
  process.env.EMAIL_FROM ?? "Valmora <noreply@vailmora.store>";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not configured — skipping email to ${opts.to}: ${opts.subject}`
    );
    return { skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  if (error) {
    console.error(`[email] Failed to send to ${opts.to}:`, error);
    throw error;
  }

  return data;
}

export function passwordResetEmail(opts: { resetUrl: string; name?: string }): string {
  const greeting = opts.name ? `Hi ${opts.name},` : "Hi,";
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-family:Georgia,serif;color:#92591f">Vailmora</h1>
    <h2>Reset your password</h2>
    <p>${greeting}</p>
    <p>We received a request to reset the password for your Vailmora account. Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="${opts.resetUrl}" style="background:#92591f;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600">
        Reset password
      </a>
    </div>
    <p style="font-size:13px;color:#555">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
    <p style="font-size:12px;color:#999;margin-top:24px">Or copy this link into your browser:<br/><a href="${opts.resetUrl}" style="color:#92591f">${opts.resetUrl}</a></p>
  </div>`;
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  total: string;
  items: { title: string; quantity: number; price: string }[];
}): string {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.title}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.price}</td></tr>`
    )
    .join("");

  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-family:Georgia,serif;color:#92591f">Vailmora</h1>
    <h2>Thank you for your order, ${order.customerName}!</h2>
    <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <thead><tr style="background:#fafafa"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;font-size:18px"><strong>Total: ${order.total}</strong></p>
    <p>We'll notify you when your order ships. Track it anytime in your account.</p>
  </div>`;
}
