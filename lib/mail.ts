import { MailtrapClient } from "@mailtrap/node";

const TOKEN = process.env.MAILTRAP_TOKEN!;
export const mailClient = new MailtrapClient({ token: TOKEN });

export async function enviarEmailRecuperacao(destinatario: string, link: string) {
  await mailClient.send({
    from: {
      email: process.env.MAILTRAP_SENDER_EMAIL!,
      name: process.env.MAILTRAP_SENDER_NAME!,
    },
    to: [{ email: destinatario }],
    subject: "Recuperação de senha - BetDreams",
    text: `Clique no link para redefinir sua senha: ${link}`,
    html: `<p>Clique no link abaixo para redefinir sua senha:</p>
           <a href="${link}" target="_blank">${link}</a>`,
  });
}
