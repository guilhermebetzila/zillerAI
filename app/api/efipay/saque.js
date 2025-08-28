import { NextResponse } from "next/server";
import 'dotenv/config';
import fs from "fs";
import https from "https";
import axios from "axios";
import forge from "node-forge";

// Config P12
const p12Path = process.env.EFI_CERT_P12_PATH;
if (!p12Path) throw new Error("❌ EFI_CERT_P12_PATH não definido");

const p12Buffer = fs.readFileSync(p12Path);
const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, process.env.EFI_CERT_PASSWORD || "");

const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
const privateKeyPem = forge.pki.privateKeyToPem(keyBags[0].key);

const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
const certPem = forge.pki.certificateToPem(certObj.cert);

const httpsAgent = new https.Agent({ cert: certPem, key: privateKeyPem, rejectUnauthorized: false });

const basicAuth = Buffer.from(`${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`).toString("base64");

async function getToken() {
  const response = await axios.post(
    `${process.env.EFI_BASE_URL}/oauth/token`,
    new URLSearchParams({ grant_type: "client_credentials", scope: "pix.write pix.read saque.write saque.read" }).toString(),
    { httpsAgent, headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": `Basic ${basicAuth}` } }
  );
  return response.data.access_token;
}

export async function POST(req) {
  try {
    const { chavePix, valor, solicitacaoId } = await req.json();
    if (!chavePix || !valor) return NextResponse.json({ error: "chavePix e valor são obrigatórios" }, { status: 400 });

    const token = await getToken();

    const response = await axios.post(
      `${process.env.EFI_BASE_URL}/pix/saque`,
      { chave: chavePix, valor, solicitacaoId: solicitacaoId || `PIX-${Date.now()}` },
      { httpsAgent, headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.response?.data || error.message }, { status: 500 });
  }
}
