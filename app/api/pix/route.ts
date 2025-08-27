import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import MercadoPagoConfig, { Payment } from 'mercadopago'

// ⚡ Loga o token no servidor (NUNCA no cliente)
console.log(
  "🔑 MERCADO_PAGO_ACCESS_TOKEN carregado:",
  process.env.MERCADO_PAGO_ACCESS_TOKEN?.slice(0, 10) + "..."
)

const mp = new MercadoPagoConfig({
  accessToken: (process.env.MERCADO_PAGO_ACCESS_TOKEN || '').trim(), // 👈 remove espaços/quebras
})

const payments = new Payment(mp)

export async function POST(req: NextRequest) {
  try {
    // 🔒 Autenticação opcional (remova se não precisar testar com usuário logado)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    let userEmail = token?.email || 'teste@exemplo.com'

    if (!userEmail) {
      console.log('🔒 Usuário não autenticado.')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { amount, description = 'Depósito via PIX' } = await req.json()
    let valor = Number(amount || 0)

    if (!valor || valor <= 0) {
      console.log('⚠️ Valor inválido:', valor)
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    // ✅ seguro contra string/null
    valor = Number(valor.toFixed(2))

    console.log('📤 Criando pagamento para:', userEmail, 'Valor:', valor)

    const paymentData = await payments.create({
      body: {
        transaction_amount: valor,
        description,
        payment_method_id: 'pix',
        payer: {
          email: userEmail,
          first_name: 'Cliente',
        },
        external_reference: userEmail,
      },
    })

    console.log('✅ PIX gerado:', paymentData.id)

    const copia_e_cola =
      paymentData.point_of_interaction?.transaction_data?.qr_code

    if (!copia_e_cola) {
      console.log('❌ Erro: Código PIX não gerado.')
      return NextResponse.json(
        { error: 'Erro ao gerar código PIX' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: paymentData.id,
      status: paymentData.status,
      copia_e_cola,
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar PIX completo:', error)
    console.error('❌ Erro ao criar PIX response.data:', error.response?.data)
    console.error('❌ Erro ao criar PIX message:', error.message)

    return NextResponse.json(
      {
        error: 'Erro interno ao criar pagamento PIX',
        detalhes: error.response?.data || error.message || error,
      },
      { status: 500 }
    )
  }
}
