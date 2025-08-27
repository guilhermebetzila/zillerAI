// app/api/saque/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, StatusSaque } from "@prisma/client";
import axios from "axios";
import https from "https";
import * as fs from "fs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, valor, chavePix } = await req.json();

    if (!userId || !valor || !chavePix) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const userIdNum = Number(userId); // ✅ força para inteiro

    // Busca usuário
    const usuario = await prisma.user.findUnique({ where: { id: userIdNum } });
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (usuario.saldo.toNumber() < valor) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Atualiza saldo do usuário
    await prisma.user.update({
      where: { id: userIdNum },
      data: { saldo: { decrement: valor } },
    });

    // Registra saque no banco
    const saque = await prisma.saque.create({
      data: {
        userId: userIdNum, // ✅ garante inteiro
        valor,
        status: StatusSaque.pendente,
      },
    });

    // Configuração do certificado
    let httpsAgent: https.Agent;
    if (process.env.NODE_ENV === "production") {
      const certBase64 = process.env.EFI_CERT_P12_BASE64;
      if (!certBase64) throw new Error("Certificado não configurado no ambiente de produção.");
      const certBuffer = Buffer.from(certBase64, "base64");
      httpsAgent = new https.Agent({
        pfx: certBuffer,
        passphrase: "",
      });
    } else {
      const certPath = process.env.EFI_CERT_P12_PATH || "./certs/certificado.p12";
      if (!fs.existsSync(certPath)) throw new Error("Certificado não encontrado no ambiente local.");
      httpsAgent = new https.Agent({
        pfx: fs.readFileSync(certPath),
        passphrase: "",
      });
    }

    // URLs da Efí
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://pix.api.efipay.com.br"
        : "https://pix-h.api.efipay.com.br";

    // Autenticação OAuth2
    const credentials = Buffer.from(
      `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
    ).toString("base64");

    console.log("➡️ Solicitando token na Efí...");

    const tokenResp = await axios.post(
      `${baseUrl}/oauth/token`,
      { grant_type: "client_credentials" },
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        httpsAgent,
      }
    );

    const accessToken = tokenResp.data.access_token;
    console.log("✅ Token recebido:", accessToken ? "OK" : "FALHOU");

    // Criação da cobrança PIX
    const body = {
      calendario: { expiracao: 3600 },
      devedor: { cpf: "12345678909", nome: usuario.nome || "Usuário" },
      valor: { original: Number(valor).toFixed(2) },
      chave: chavePix.trim(),
      infoAdicional: [{ nome: "Saque", valor: "Plataforma" }],
    };

    console.log("➡️ Criando cobrança PIX...");

    const pixResp = await axios.post(
      `${baseUrl}/v2/cob`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        httpsAgent,
      }
    );

    const txId = pixResp.data.txid;
    console.log("✅ Cobrança criada, txId:", txId);

    // Atualiza saque com status concluído e salva txId
    await prisma.saque.update({
      where: { id: saque.id },
      data: { status: StatusSaque.concluido, txId },
    });

    return NextResponse.json({ success: true, saqueId: saque.id, txId });

  } catch (error: any) {
    console.error("❌ Erro no saque:", error.response?.data || error.message);

    return NextResponse.json(
      { error: "Erro ao processar saque", details: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
