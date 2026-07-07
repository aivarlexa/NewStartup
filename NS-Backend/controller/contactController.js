const nodemailer = require("nodemailer");
const { getMailConfig } = require("../config/env");

let cachedTransporter = null;

function isMailConfigured() {
  return getMailConfig().isConfigured;
}

function getTransporter() {
  const mailConfig = getMailConfig();

  if (!mailConfig.isConfigured) return null;

  if (cachedTransporter) {
    return cachedTransporter;
  }

  console.log({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,
  user: mailConfig.user,
  recipient: mailConfig.recipient,
});

  cachedTransporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
      family: 4,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass,
    },
    
  });
  cachedTransporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Verify Error:", error);
  } else {
    console.log("SMTP Server is ready");
  }
});


  return cachedTransporter;
}

function getClientFromHeader(name, mailConfig) {
  const displayName = String(name || "Website Client").replace(/"/g, "'");
  return `"${displayName}" <${mailConfig.user}>`;
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

    const transporter = getTransporter();

    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: "Mail service is not configured.",
      });
    }

    const mailConfig = getMailConfig();

    if (!mailConfig.recipient) {
      return res.status(500).json({
        success: false,
        message: "Mail recipient is not configured.",
      });
    }

    console.log("Mail Config:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER,
  recipient: process.env.RECEIVER_EMAIL,
});

    await transporter.sendMail({
      from: getClientFromHeader(fullName, mailConfig),
      to: mailConfig.recipient,
      replyTo: email,
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

