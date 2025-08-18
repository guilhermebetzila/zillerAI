import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import MercadoPagoConfig, { Payment } from 'mercadopago'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

const payments = new Payment(mp)

// ✅ GET para testes/pings do Mercado Pago
export async function GET() {
  console.log('📡 Webhook GET recebido (teste do Mercado Pago)')
  return NextResponse.json({ status: 'ok', message: 'Webhook ativo' }, { status: 200 })
}

// ✅ POST para eventos reais de pagamento
export async function POST(req: Request) {
  console.log('🚨 Webhook POST recebido!')

  try {
    const body = await req.json()
    console.log('🧾 Conteúdo do webhook:', body)

    const action = body.action
    if (!['payment.created', 'payment.updated'].includes(action)) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'ID ausente' }, { status: 400 })
    }

    // 👉 Se for ID de teste (não numérico real), apenas retornar OK
    if (isNaN(Number(paymentId))) {
      console.log('⚠️ Recebido ID de teste, ignorando:', paymentId)
      return NextResponse.json({ status: 'test event recebido' }, { status: 200 })
    }

    let paymentData
    try {
      paymentData = await payments.get({ id: String(paymentId) })
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes do pagamento:', error)
      return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 200 }) // não quebrar o fluxo
    }

    const status = (paymentData.status ?? '').toString().trim().toLowerCase()
    const tipo = (paymentData.payment_type_id ?? '').toString().trim().toLowerCase()
    const valor = paymentData.transaction_amount
    const externalRefRaw = paymentData.external_reference

    console.log('📦 Dados do pagamento recebidos do Mercado Pago:', {
      status,
      tipo,
      valor,
      email: externalRefRaw,
    })

    if (typeof externalRefRaw !== 'string' || !externalRefRaw.trim()) {
      return NextResponse.json({ error: 'Email ausente ou inválido' }, { status: 400 })
    }

    const email = externalRefRaw.trim().toLowerCase()
    const aprovado = status === 'approved'
    const tiposAceitos = ['pix', 'bank_transfer', 'account_money']
    const tipoAceito = tiposAceitos.includes(tipo)

    if (aprovado && tipoAceito) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 400 })
      }

      await prisma.user.update({
        where: { email },
        data: { saldo: { increment: valor } },
      })

      console.log(`✅ Saldo atualizado para ${email}: +${valor}`)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ status: 'aguardando aprovação ou tipo inválido' }, { status: 200 })
  } catch (error) {
    console.error('❌ Erro geral no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
