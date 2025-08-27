// app/pages/api/sockets.ts
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const preference = await new Preference(mercadopago).create({
      body: {
        items: [
          {
            id: '1234',
            title: 'Depósito via PIX',
            quantity: 1,
            unit_price: body.valor || 10,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: body.email || 'comprador@exemplo.com',
        },
        payment_methods: {
          default_payment_method_id: 'pix',
          excluded_payment_types: [{ id: 'ticket' }],
        },
        back_urls: {
          success: 'https://betdreams.com.br/sucesso',
          failure: 'https://betdreams.com.br/erro',
          pending: 'https://betdreams.com.br/pendente',
        },
      },
    });

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
    });
  } catch (err: any) {
    console.error('Erro ao criar pagamento', err);
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 });
  }
}
