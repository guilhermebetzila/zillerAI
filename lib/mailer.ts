import nodemailer from 'nodemailer';

export async function sendWelcomeEmail(to: string, name: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Bem-vindo à Ziller.Ia!',
    html: `
      <h1>Olá, ${name}!</h1>
      <p>Seja bem-vindo à nossa plataforma. Estamos felizes em ter você!</p>
      <p>Explore nossas funcionalidades e comece a investir com inteligência artificial!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
