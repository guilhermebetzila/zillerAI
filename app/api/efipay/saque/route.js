import { NextResponse } from "next/server";
import https from "https";
import axios from "axios";

// ========= FUNÇÃO PARA GERAR TOKEN =========
async function gerarToken() {
  if (!process.env.EFI_CERT_P12_BASE64) {
    throw new Error("Variável EFI_CERT_P12_BASE64 não definida no ambiente");
  }

  const p12Der = Buffer.from(process.env.EFI_CERT_P12_BASE64, "base64");
  const httpsAgent = new https.Agent({
    pfx: p12Der,
    passphrase: process.env.EFI_CERT_PASSWORD || "",
    rejectUnauthorized: false,
  });

  const tokenResponse = await axios.post(
    `${process.env.EFI_BASE_URL}/oauth/token`,
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      auth: {
        username: process.env.EFI_CLIENT_ID,
        password: process.env.EFI_CLIENT_SECRET,
      },
      httpsAgent,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  console.log("🔑 Token gerado:", tokenResponse.data?.access_token);
  return { token: tokenResponse.data?.access_token, httpsAgent };
}

// ========= ENDPOINT DE SAQUE =========
export async function POST(req) {
  try {
    const { valor, chavePix, userId } = await req.json();

    if (!valor || !chavePix) {
      return NextResponse.json(
        { error: "Valor e chave PIX são obrigatórios" },
        { status: 400 }
      );
    }

    const { token, httpsAgent } = await gerarToken();

    const payload = {
      valor: Number(valor).toFixed(2),
      favorecido: { chave: chavePix },
      infoPagador: `Saque do usuário ${userId || "N/A"}`,
    };

    console.log("🌐 Tentando enviar PIX para Efipay...");
    console.log("📦 Payload PIX:", payload);

    const saqueRes = await axios.post(
      `${process.env.EFI_BASE_URL}/v2/pix/envio`,
      payload,
      {
        httpsAgent,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Resposta Efipay:", saqueRes.data);

    return NextResponse.json({
      success: true,
      txId: saqueRes.data.txId || null,
      status: saqueRes.data.status || "PENDING",
    });
  } catch (error) {
    console.error("❌ Erro ao enviar PIX:", error.response?.data || error.message);

    // Só loga se a chave não existir, mas não quebra o fluxo
    if (error.response?.data?.nome === "nao_encontrado") {
      return NextResponse.json({
        success: false,
        message: "Chave PIX não encontrada no Efipay",
        details: error.response.data,
      });
    }

    return NextResponse.json(
      { error: "Erro ao processar saque PIX", details: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
