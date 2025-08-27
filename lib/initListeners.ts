// lib/initListeners.ts
import { startUSDTListener } from "./usdtListener";

// Usar globalThis para evitar múltiplas execuções em ambientes serverless
declare global {
  // eslint-disable-next-line no-var
  var _listenersBootstrapped: boolean | undefined;
}

export function initListeners() {
  if (globalThis._listenersBootstrapped) {
    console.log("⚡ Listeners já estavam iniciados, ignorando.");
    return;
  }

  console.log("🚀 Iniciando listeners…");
  startUSDTListener();

  globalThis._listenersBootstrapped = true;
}
