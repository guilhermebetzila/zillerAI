// app/api/efi/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // a Efí enviará eventos dos Pix
  const body = await req.json().catch(() => null);
  // adapte conforme o payload da Efí que você habilitar
  // (ex.: confirmação do pagamento, download de recibo, etc.)
  console.log("Webhook Efí:", body);

  // se vier e2eId/status, você pode reconciliar:
  // await prisma.withdrawalRequest.update({ where: { e2eId }, data: { status: "PAID" } });

  return NextResponse.json({ received: true });
}
