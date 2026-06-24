const nodemailer = require("nodemailer");

const submitContact = async (req, res) => {
  try {
    const {
      fullName,
      email,
      company,
      service,
      message,
    } = req.body;

    if (!fullName || !email || !service || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: `New Contact Form Submission - ${service}`,
  html: `
    <h2>New Contact Form Submission</h2>

    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Company:</strong> ${company || "Not Provided"}</p>
    <p><strong>Service:</strong> ${service}</p>

    <h3>Message</h3>
    <p>${message}</p>
  `
});
    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { submitContact };