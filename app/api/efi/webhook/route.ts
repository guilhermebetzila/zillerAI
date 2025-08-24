// app/scripts/registerWebhook.ts
import "dotenv/config";
import fetch from "node-fetch";

async function registerWebhook() {
  try {
    console.log("🔑 EFI_PAYER_PIX_KEY:", process.env.EFI_PAYER_PIX_KEY);

    if (!process.env.EFI_PAYER_PIX_KEY) {
      throw new Error("❌ Variável EFI_PAYER_PIX_KEY não encontrada no .env");
    }

    const payerKey = process.env.EFI_PAYER_PIX_KEY;

    // 🔗 URL do webhook (ajuste para sua rota real)
    const webhookUrl = "https://seuservidor.com/api/efi/webhook?hmac=meuhash1234";

    console.log("📡 Registrando webhook na Efí...");
    const response = await fetch("https://pix-h.api.efipay.com.br/v2/webhook", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.EFI_ACCESS_TOKEN || "SEU_TOKEN_AQUI"}`
      },
      body: JSON.stringify({
        webhookUrl,
        chave: payerKey
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`❌ Erro ao registrar webhook: ${JSON.stringify(data)}`);
    }

    console.log("✅ Webhook registrado com sucesso:", data);
  } catch (err: any) {
    console.error("❌ Erro no script:", err.message || err);
  }
}

registerWebhook();
