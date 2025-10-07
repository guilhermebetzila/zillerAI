// route.ts
import { enviarEmailRecuperacao } from "@lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "E-mail não informado." }), { status: 400 });
    }

    const link = `https://ziller.club/resetar-senha?email=${email}`;
    
    await enviarEmailRecuperacao(email, link);

    return new Response(JSON.stringify({ message: "E-mail de recuperação enviado com sucesso!" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    return new Response(JSON.stringify({ error: "Não foi possível enviar o e-mail." }), {
      status: 500,
    });
  }
}
