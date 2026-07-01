import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT || "587";
const SMTP_SECURE = process.env.SMTP_SECURE === "true";

const EMAIL_FROM = process.env.EMAIL_FROM || `"Duks Juice Inc." <${SMTP_USER}>` || "no-reply@example.com";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("Gmail SMTP not configured (missing SMTP_USER / SMTP_PASS).");
  }
  if (!to) {
    throw new Error("Missing 'to' address for sendEmail.");
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    html,
    text: text || undefined,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Gmail SMTP: email sent to ${to} (messageId: ${info.messageId})`);
  return info;
};
