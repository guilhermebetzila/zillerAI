import { NextResponse } from "next/server";
import https from "https";
import axios from "axios";
import forge from "node-forge";

// ========= FUNÇÃO PARA GERAR TOKEN =========
async function gerarToken() {
  if (!process.env.EFI_CERT_P12_BASE64) {
    throw new Error("Variável EFI_CERT_P12_BASE64 não definida no ambiente");
  }

  const p12Der = Buffer.from(process.env.EFI_CERT_P12_BASE64, "base64");
  const p12Asn1 = forge.asn1.fromDer(p12Der.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, process.env.EFI_CERT_PASSWORD || "");

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
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  console.log("🔑 Token gerado:", tokenResponse.data?.access_token);
  return { token: tokenResponse.data?.access_token, httpsAgent };
}

// ========= FUNÇÃO PARA CADASTRAR CHAVE SECUNDÁRIA =========
async function cadastrarChaveSecundaria(chavePix, token, httpsAgent) {
  const payload = {
    chave: chavePix,
    tipo: "EMAIL", // ou CPF/CNPJ conforme necessário
    conta: { codigoBanco: "817388", tipo: "CONTA_CORRENTE" } // ajustes conforme sua conta
  };

  try {
    const res = await axios.post(
      `${process.env.EFI_BASE_URL}/v2/pix/conta-secundaria`,
      payload,
      {
        httpsAgent,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Chave secundária cadastrada:", res.data);
    return true;
  } catch (error) {
    console.error("❌ Erro ao cadastrar chave secundária:", error.response?.data || error.message);
    return false;
  }
}

// ========= ENDPOINT DE SAQUE =========
export async function POST(req) {
  try {
    const { valor, chavePix, userId } = await req.json();

    if (!valor || !chavePix) {
      return NextResponse.json({ error: "Valor e chave PIX são obrigatórios" }, { status: 400 });
    }

    const { token, httpsAgent } = await gerarToken();

    // Primeiro cadastramos a chave secundária (garante que a conta existe)
    await cadastrarChaveSecundaria(chavePix, token, httpsAgent);

    const payload = {
      valor: Number(valor).toFixed(2),
      favorecido: { chave: chavePix },
      infoPagador: `Saque do usuário ${userId || "N/A"}`,
    };

    console.log("🌐 URL PIX Saque:", `${process.env.EFI_BASE_URL}/v2/pix/envio`);
    console.log("📦 Payload PIX Saque:", payload);

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

    console.log("✅ Saque PIX enviado:", saqueRes.data);

    return NextResponse.json({
      success: true,
      txId: saqueRes.data.txId || null,
      status: saqueRes.data.status || "PENDING",
    });
  } catch (error) {
    console.error("❌ Erro no saque PIX:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao processar saque PIX", details: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
