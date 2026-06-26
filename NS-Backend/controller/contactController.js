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

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure:
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
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

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.RECEIVER_EMAIL,
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