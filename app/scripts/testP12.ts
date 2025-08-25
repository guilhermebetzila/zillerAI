import fs from "fs";
import https from "https";

const certPath = "app/certs/producao-817388-zilerai.p12";
const certPassword = ""; // deixa vazio se não tiver senha

try {
  const pfxBuffer = fs.readFileSync(certPath);
  const agent = new https.Agent({ pfx: pfxBuffer, passphrase: certPassword || undefined });
  console.log("✅ Certificado P12 carregado com sucesso!");
} catch (err) {
  console.error("❌ Erro ao abrir o P12:", err);
}
