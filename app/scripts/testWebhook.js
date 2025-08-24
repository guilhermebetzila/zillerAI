// Para usar fetch no Node.js sem ES Modules
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testeWebhook() {
  const url = "https://ziller.club/api/efi/webhook";

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teste: "ok" }),
    });

    const data = await resp.json();
    console.log("Resposta do webhook:", data);
  } catch (err) {
    console.error("Erro ao testar webhook:", err);
  }
}

testeWebhook();
