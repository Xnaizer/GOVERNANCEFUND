import nodemailer from "nodemailer";
import { env } from "../config/env";
import path from "node:path";
import ejs from "ejs";

interface IEmail {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

async function renderTemplate(
  templateName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "emails",
    `${templateName}.ejs`,
  );
  return ejs.renderFile(templatePath, data);
}

export async function sendTemplateEmail(params: IEmail): Promise<void> {
  const html = await renderTemplate(params.template, params.data);

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html,
  });
}

export async function verifyMailer(): Promise<void> {
  await transporter.verify();
  console.log("[MAILER] SMTP Connection verified");
}
