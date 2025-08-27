// lib/efi.ts
import axios from "axios";
import https from "https";

const BASE_URL = process.env.EFI_BASE_URL!;
const P12_BASE64 = process.env.EFI_CERT_P12_BASE64!;
const P12_PASSPHRASE = process.env.EFI_CERT_PASSWORD || "";
const CLIENT_ID = process.env.EFI_CLIENT_ID!;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET!;

function makeHttpsAgent() {
  const pfx = Buffer.from(P12_BASE64, "base64");
  return new https.Agent({ pfx, passphrase: P12_PASSPHRASE, keepAlive: true });
}

export async function getEfiToken(scopes = "pix.send gn.pix.send.read gn.balance.read") {
  const httpsAgent = makeHttpsAgent();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: scopes,
  }).toString();

  const resp = await axios.post(`${BASE_URL}/oauth/token`, body, {
    httpsAgent,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Encoding": "identity",
    },
    auth: { username: CLIENT_ID, password: CLIENT_SECRET },
  });

  return resp.data.access_token as string;
}

/**
 * Envia um PIX via Efí
 * @param idEnvio string único (idempotência) - use o id do saque
 * @param amount  número em reais (ex.: 150.75)
 * @param payerKey chave PIX da SUA conta Efí (pagador)
 * @param recipientKey chave PIX do usuário (favorecido)
 * @param description texto opcional (máx 140 chars)
 */
export async function efiSendPix(params: {
  idEnvio: string;
  amount: number;
  payerKey: string;
  recipientKey: string;
  description?: string;
}) {
  const token = await getEfiToken();
  const httpsAgent = makeHttpsAgent();

  const payload = {
    valor: params.amount.toFixed(2), // string com 2 casas
    pagador: { chave: params.payerKey },
    favorecido: { chave: params.recipientKey },
    infoPagador: params.description?.slice(0, 140),
  };

  const url = `${BASE_URL}/v3/gn/pix/${encodeURIComponent(params.idEnvio)}`;
  const resp = await axios.put(url, payload, {
    httpsAgent,
    headers: { Authorization: `Bearer ${token}` },
  });

  return resp.data as {
    e2eId: string;
    horario: string;
    status: string;
  };
}
