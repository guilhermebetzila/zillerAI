// app/api/binance/saldo/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { gerarAssinatura, gerarNonce, gerarTimestamp } from '@/lib/binancePay';

const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;

export async function GET() {
  try {
    const timestamp = gerarTimestamp();
    const nonce = gerarNonce();
    const payload = `${timestamp}${nonce}`;
    const signature = gerarAssinatura(payload, SECRET_KEY);

    const response = await axios.get(
      'https://bpay.binanceapi.com/binancepay/openapi/v2/account',
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

    console.log('[SALDO] Sucesso:', response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[SALDO] Erro:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
