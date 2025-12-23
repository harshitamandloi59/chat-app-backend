const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

function otp(n) {
  let code = "";
  for (let i = 0; i < n; i++) {
    code += Math.floor(Math.random() * 10);
  }
  console.log("otp", code);
  return code;
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

const sentOtp = async (email, code) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject: "OTP Verification",
      html: `<p>Your OTP is: <strong>${code}</strong></p>`,
    });
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Email error:", err);
  }
};

module.exports = { otp, sentOtp };
