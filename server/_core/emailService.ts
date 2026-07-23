import nodemailer from "nodemailer";
import { ENV } from "./env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.emailUser,
    pass: ENV.emailPass,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetToken: string
): Promise<boolean> {
  if (!ENV.emailUser || !ENV.emailPass) {
    console.warn("[EMAIL] EMAIL_USER or EMAIL_PASS not configured");
    return false;
  }

  const resetUrl = `https://game.zanona.com.br/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"CapyZen 🐹" <${ENV.emailUser}>`,
    to,
    subject: "Recuperação de Senha - CapyZen",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #16213e; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; color: white; }
          .header .emoji { font-size: 48px; margin-bottom: 10px; }
          .content { padding: 30px; }
          .content p { color: #94a3b8; line-height: 1.6; margin-bottom: 15px; }
          .content .username { color: #10b981; font-weight: bold; }
          .btn { display: block; width: 100%; padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; text-align: center; margin: 20px 0; }
          .btn:hover { background: linear-gradient(135deg, #059669, #047857); }
          .footer { padding: 20px 30px; background: #0f172a; text-align: center; }
          .footer p { color: #64748b; font-size: 12px; margin: 0; }
          .token { background: #1e293b; padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; color: #10b981; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🐹</div>
            <h1>CapyZen</h1>
          </div>
          <div class="content">
            <p>Olá <span class="username">${username}</span>!</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetUrl}" class="btn">🔑 Redefinir Senha</a>
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <div class="token">${resetUrl}</div>
            <p style="margin-top: 20px;">Se você não solicitou esta alteração, ignore este email. Sua senha atual permanecerá segura.</p>
            <p>Este link expira em <strong>1 hora</strong>.</p>
          </div>
          <div class="footer">
            <p>CapyZen - O universo virtual das capivaras 🐹</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Password reset sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error);
    return false;
  }
}
