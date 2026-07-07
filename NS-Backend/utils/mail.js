const { getMailConfig } = require("../config/env");
const { Resend } = require("resend");

let cachedResendInstance = null;

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
  // While testing with a free Resend account, you must use onboarding@resend.dev
  return `${displayName} <onboarding@resend.dev>`;
}

async function sendBookingConfirmation(booking, adminEmail) {
  const resendClient = getResendClient();
  if (!resendClient) {
    throw new Error("Mail service API key is not configured.");
  }

  // ⚠️ SANDBOX BYPASS: Force recipient to your approved test email to prevent 403 errors
  const recipients = ["aivarlexa@gmail.com"];

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.55;">
      <h2>[TEST] Meeting confirmed</h2>
      <p style="color: #d93838;"><strong>Notice:</strong> This test email was rerouted to you from the sandbox. The actual client target was: <em>${booking.email}</em></p>
      <hr />
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
        <tr><td><strong>Name</strong></td><td>${booking.name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${booking.email}</td></tr>
        <tr><td><strong>Company</strong></td><td>${booking.company || "N/A"}</td></tr>
        <tr><td><strong>Purpose</strong></td><td>${booking.purpose}</td></tr>
        <tr><td><strong>When</strong></td><td>${formatMeetingDate(booking)}</td></tr>
        <tr><td><strong>Whereby Video Call</strong></td><td><a href="${booking.videoLink}">${booking.videoLink}</a></td></tr>
      </table>
    </div>
  `;

  const { error } = await resendClient.emails.send({
    from: getClientFromHeader(booking.name),
    to: recipients,
    replyTo: booking.email, // Hitting reply will still address the actual client!
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

  // ⚠️ SANDBOX BYPASS: Force recipient to your approved test email to prevent 403 errors
  const recipients = ["aivarlexa@gmail.com"];

  let statusText = action === "cancel" ? "cancelled" : "updated";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.55;">
      <h2>[TEST] Meeting Notice</h2>
      <p style="color: #d93838;"><strong>Notice:</strong> The actual client target was: <em>${booking.email}</em></p>
      <hr />
      <p>Your Varlexa AI meeting slot has been <strong>${statusText}</strong>.</p>
      <p><strong>Details:</strong> ${formatMeetingDate(booking)}</p>
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