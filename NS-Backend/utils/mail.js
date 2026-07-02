const nodemailer = require("nodemailer");
const { getMailConfig } = require("../config/env");

let cachedTransporter = null;

function isMailConfigured() {
  return getMailConfig().isConfigured;
}

function getTransporter() {
  const mailConfig = getMailConfig();
  if (!mailConfig.isConfigured) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  return cachedTransporter;
}

function formatMeetingDate(booking) {
  return `${booking.date} at ${booking.time} (${booking.duration} minutes)`;
}

async function sendBookingConfirmation(booking, adminEmail) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("Mail service is not configured.");
  }

  const mailConfig = getMailConfig();

  const recipients = [booking.email, adminEmail || mailConfig.recipient].filter(Boolean);
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.55;">
      <h2>Meeting confirmed</h2>
      <p>Your Varlexa AI meeting has been scheduled.</p>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
        <tr><td><strong>Name</strong></td><td>${booking.name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${booking.email}</td></tr>
        <tr><td><strong>Company</strong></td><td>${booking.company || "N/A"}</td></tr>
        <tr><td><strong>Purpose</strong></td><td>${booking.purpose}</td></tr>
        <tr><td><strong>When</strong></td><td>${formatMeetingDate(booking)}</td></tr>
        <tr><td><strong>Google Meet</strong></td><td><a href="${booking.meetLink}">${booking.meetLink}</a></td></tr>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: mailConfig.from,
    to: recipients.join(","),
    replyTo: booking.email,
    subject: `Meeting confirmed - ${booking.date} ${booking.time}`,
    html,
  });
}

async function sendBookingUpdate(booking, adminEmail, action) {
  const transporter = getTransporter();
  if (!transporter) return;

  const mailConfig = getMailConfig();

  await transporter.sendMail({
    from: mailConfig.from,
    to: [booking.email, adminEmail || mailConfig.recipient].filter(Boolean).join(","),
    subject: `Meeting ${action} - ${booking.date} ${booking.time}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.55;">
        <h2>Meeting ${action}</h2>
        <p><strong>${booking.purpose}</strong></p>
        <p>${formatMeetingDate(booking)}</p>
        ${booking.meetLink ? `<p>Google Meet: <a href="${booking.meetLink}">${booking.meetLink}</a></p>` : ""}
        ${booking.cancellationReason ? `<p>Reason: ${booking.cancellationReason}</p>` : ""}
      </div>
    `,
  });
}

module.exports = {
  getTransporter,
  isMailConfigured,
  sendBookingConfirmation,
  sendBookingUpdate,
};

