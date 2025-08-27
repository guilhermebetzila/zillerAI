// app/api/binance/enviar/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { gerarAssinatura, gerarNonce, gerarTimestamp } from '@/lib/binancePay';
import { prisma } from '@/lib/prisma';
import { StatusSaque } from '@prisma/client'; // ✅ enum do Prisma

const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;

export async function POST(req: Request) {
  try {
    const { userId, valor, carteiraUsdt } = await req.json();

    if (!userId || !valor || !carteiraUsdt) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 });
    }

    // ✅ Buscar usuário
    const usuario = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // ✅ Montar request Binance Pay
    const timestamp = gerarTimestamp();
    const nonce = gerarNonce();

    const body = {
      amount: valor.toString(),
      currency: 'USDT',
      payeeEmail: carteiraUsdt,
      transferPurpose: 'PAYMENT',
    };

    const payload = `${timestamp}${nonce}${JSON.stringify(body)}`;
    const signature = gerarAssinatura(payload, SECRET_KEY);

    const response = await axios.post(
      'https://bpay.binanceapi.com/binancepay/openapi/v2/transfer',
      body,
      {
        headers: {
          'BinancePay-Timestamp': timestamp,
          'BinancePay-Nonce': nonce,
          'BinancePay-Certificate-SN': API_KEY,
          'BinancePay-Signature': signature,
          'Content-Type': 'application/json',
        },
      }
    );

    // ✅ Registrar saque
    const saque = await prisma.saque.create({
      data: {
        userId: usuario.id,             // 👈 campo correto
        valor,
        metodo: "USDT",
        chave: carteiraUsdt,
        status: StatusSaque.concluido,  // 👈 enum válido
        responseApi: JSON.stringify(response.data),
      },
    });

    console.log('[ENVIAR USDT] Sucesso:', response.data);
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('[ENVIAR USDT] Erro:', error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data || error.message }, { status: 500 });
  }
}
