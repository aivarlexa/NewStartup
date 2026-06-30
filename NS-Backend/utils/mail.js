const nodemailer = require("nodemailer");

let cachedTransporter = null;

function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
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

  const recipients = [booking.email, adminEmail].filter(Boolean);
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
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: recipients.join(","),
    replyTo: booking.email,
    subject: `Meeting confirmed - ${booking.date} ${booking.time}`,
    html,
  });
}

async function sendBookingUpdate(booking, adminEmail, action) {
  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: [booking.email, adminEmail].filter(Boolean).join(","),
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
