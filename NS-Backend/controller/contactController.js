const { Resend } = require("resend");
const { getMailConfig } = require("../config/env");

let cachedResendInstance = null;

function isMailConfigured() {
  return getMailConfig().isConfigured;
}

function getResendClient() {
  const mailConfig = getMailConfig();

  // If your env config isn't set up yet, return null
  if (!mailConfig.isConfigured || !process.env.RESEND_API_KEY) return null;

  if (cachedResendInstance) {
    return cachedResendInstance;
  }

  // Initialize the Resend client using an API Key via HTTPS (Port 443)
  cachedResendInstance = new Resend(process.env.RESEND_API_KEY);
  return cachedResendInstance;
}

function getClientFromHeader(name, mailConfig) {
  const displayName = String(name || "Website Client").replace(/"/g, "'");
  // NOTE: For free Resend accounts, you must send FROM "onboarding@resend.dev" 
  // until you verify your own custom domain name.
  return `${displayName} <onboarding@resend.dev>`;
}

const submitContact = async (req, res) => {
  try {
    const { fullName, email, company, service, message } = req.body;

    if (!fullName || !email || !service || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const resendClient = getResendClient();

    if (!resendClient) {
      return res.status(500).json({
        success: false,
        message: "Mail service API key is not configured.",
      });
    }

    const mailConfig = getMailConfig();

    if (!mailConfig.recipient) {
      return res.status(500).json({
        success: false,
        message: "Mail recipient is not configured.",
      });
    }

    // Send the email via Resend's HTTPS API wrapper instead of SMTP
    const { data, error } = await resendClient.emails.send({
      from: getClientFromHeader(fullName, mailConfig),
      to: mailConfig.recipient,
      replyTo: email, // This lets you hit "Reply" in your inbox to email the client back directly
      subject: `New Contact Form Submission - ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Contact Form Submission</h2>

          <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
            <tr>
              <td><strong>Full Name</strong></td>
              <td>${fullName}</td>
            </tr>

            <tr>
              <td><strong>Email</strong></td>
              <td>${email}</td>
            </tr>

            <tr>
              <td><strong>Company</strong></td>
              <td>${company || "N/A"}</td>
            </tr>

            <tr>
              <td><strong>Service</strong></td>
              <td>${service}</td>
            </tr>

            <tr>
              <td><strong>Message</strong></td>
              <td>${message}</td>
            </tr>
          </table>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to send message via API.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Contact Mail Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send message.",
    });
  }
};

module.exports = {
  submitContact,
};