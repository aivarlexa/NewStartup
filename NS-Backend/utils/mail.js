const { getMailConfig } = require("../config/env");
const { Resend } = require("resend");

let cachedResendInstance = null;

// Define it statically here so it never fails or shows undefined
const WHEREBY_LINK = "https://whereby.com/varlexaai-meet";

function isMailConfigured() {
  return getMailConfig().isConfigured;
}

function getResendClient() {
  const mailConfig = getMailConfig();
  if (!mailConfig.isConfigured || !process.env.RESEND_API_KEY) return null;
  if (cachedResendInstance) return cachedResendInstance;

  cachedResendInstance = new Resend(process.env.RESEND_API_KEY);
  return cachedResendInstance;
}

function formatMeetingDate(booking) {
  return `${booking.date} at ${booking.time} (${booking.duration} minutes)`;
}

function getClientFromHeader(name) {
  const displayName = String(name || "Website Client").replace(/"/g, "'");
  return `${displayName} <onboarding@resend.dev>`;
}

async function sendBookingConfirmation(booking, adminEmail) {
  const resendClient = getResendClient();
  if (!resendClient) {
    throw new Error("Mail service API key is not configured.");
  }

  // 👑 FIX: Fallback to sandbox email if adminEmail isn't resolved, but prioritize the adminEmail argument
  const resolvedAdmin = adminEmail || "aivarlexa@gmail.com";
  const recipients = [resolvedAdmin];

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.55;">
      <h2>[SYSTEM] Meeting Confirmed</h2>
      <p>A new meeting has been booked by a workspace client.</p>
      <p style="color: #1f6feb;"><strong>Target Client Reroute Email:</strong> <em>${booking.email}</em></p>
      <hr style="border: 1px solid #21262d;" />
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; border: 1px solid #30363d;">
        <tr style="background: #161b22; color: #f0f6fc;"><td><strong>Detail Field</strong></td><td><strong>Value Reference</strong></td></tr>
        <tr><td><strong>Name</strong></td><td>${booking.name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${booking.email}</td></tr>
        <tr><td><strong>Company</strong></td><td>${booking.company || "N/A"}</td></tr>
        <tr><td><strong>Purpose</strong></td><td>${booking.purpose}</td></tr>
        <tr><td><strong>When</strong></td><td>${formatMeetingDate(booking)}</td></tr>
        <tr><td><strong>Whereby Video Call</strong></td><td><a href="${WHEREBY_LINK}">${WHEREBY_LINK}</a></td></tr>
      </table>
    </div>
  `;

  const { error } = await resendClient.emails.send({
    from: getClientFromHeader(booking.name),
    to: recipients,
    replyTo: booking.email,
    subject: `Meeting confirmed - ${booking.date} ${booking.time}`,
    html,
  });

  if (error) {
    console.error("Resend Confirmation Error:", error);
    throw new Error("Failed to send booking confirmation email.");
  }
}

async function sendBookingUpdate(booking, adminEmail, action) {
  const resendClient = getResendClient();
  if (!resendClient) return;

  // 👑 FIX: Direct updates explicitly to the designated administrator's inbox
  const resolvedAdmin = adminEmail || "aivarlexa@gmail.com";
  const recipients = [resolvedAdmin];
  let statusText = action === "cancel" ? "cancelled" : "updated";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.55;">
      <h2>[SYSTEM] Meeting Notice</h2>
      <p style="color: #f85149;"><strong>Ecosystem Alert:</strong> The meeting status has mutated.</p>
      <p>The actual client target was: <em>${booking.email}</em></p>
      <hr style="border: 1px solid #21262d;" />
      <p>A Varlexa AI meeting slot has been officially <strong>${statusText}</strong>.</p>
      <p><strong>Timeline Details:</strong> ${formatMeetingDate(booking)}</p>
      <p><strong>Meeting Room Link:</strong> <a href="${WHEREBY_LINK}">${WHEREBY_LINK}</a></p>
    </div>
  `;

  await resendClient.emails.send({
    from: getClientFromHeader("Booking System"),
    to: recipients,
    replyTo: booking.email,
    subject: `Meeting Notification (${statusText.toUpperCase()}) - ${booking.date} ${booking.time}`,
    html,
  });
}

module.exports = {
  isMailConfigured,
  sendBookingConfirmation,
  sendBookingUpdate,
};