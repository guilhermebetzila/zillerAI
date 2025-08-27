// app/api/binance/saque/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { gerarAssinatura, gerarNonce, gerarTimestamp } from '@/lib/binancePay';
import { prisma } from '@/lib/prisma';
import { StatusSaque } from '@prisma/client'; // ✅ importa o enum do Prisma

const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;

export async function POST(req: Request) {
  try {
    const { userId, valor, carteiraUsdt } = await req.json();

    if (!userId || !valor || !carteiraUsdt) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 });
    }

    // ✅ Buscar usuário no banco
    const usuario = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Gerar assinatura e dados para Binance Pay
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

    // Enviar requisição para Binance Pay
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

    // ✅ Salvar saque no banco
    const saque = await prisma.saque.create({
      data: {
        userId: usuario.id,
        valor,
        metodo: "USDT",
        chave: carteiraUsdt,
        status: StatusSaque.concluido, // 👈 agora usa o enum correto
        responseApi: JSON.stringify(response.data),
      },
    });

    console.log('[SAQUE USDT] Sucesso:', response.data);
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('[SAQUE USDT] Erro:', error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data || error.message }, { status: 500 });
  }
}
