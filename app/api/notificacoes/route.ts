import { NextResponse } from 'next/server';

export async function GET() {
  // Aqui você buscaria do banco de dados as notificações
  const notificacoes = [
    { id: 1, mensagem: 'Bem-vindo ao Ziller Club!', lida: false },
    { id: 2, mensagem: 'Seu depósito foi aprovado.', lida: true },
    { 
      id: 3, 
      mensagem: 'Plataforma está em manutenção de atualização, em breve serão retornados os saldos atualizados de todos usuários.', 
      lida: false 
    },
  ];
  return NextResponse.json(notificacoes);
}
