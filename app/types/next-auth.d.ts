import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nome: string;
      email: string;
      saldo: number;
      valorInvestido: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    nome: string;
    email: string;
    saldo: number;
    valorInvestido: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nome: string;
    email: string;
    saldo: number;
    valorInvestido: number;
  }
}
