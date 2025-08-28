import { NextResponse } from "next/server";
import https from "https";
import axios from "axios";
import forge from "node-forge";

// ========= FUNÇÃO PARA GERAR TOKEN =========
async function gerarToken() {
  // Decodifica P12 do Base64 (Vercel)
  if (!process.env.EFI_CERT_P12_BASE64) {
    throw new Error("Variável EFI_CERT_P12_BASE64 não definida no ambiente");
  }

  const p12Der = Buffer.from(process.env.EFI_CERT_P12_BASE64, "base64");
  const p12Asn1 = forge.asn1.fromDer(p12Der.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    p12Asn1,
    process.env.EFI_CERT_PASSWORD || ""
  );

  const keyObj = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
  const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0].cert;

  const httpsAgent = new https.Agent({
    pfx: p12Der,
    passphrase: process.env.EFI_CERT_PASSWORD || "",
    rejectUnauthorized: false, // ⚠️ true em produção
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
      valor: Number(valor).toFixed(2), // string formatada
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
      {
        error: "Erro ao processar saque PIX",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
