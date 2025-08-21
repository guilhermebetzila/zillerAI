// app/api/auth/[...nextauth]/authOptions.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Preencha todos os campos");
        }

        // ✅ garante que o email nunca seja undefined
        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("Email não encontrado");
        }

        if (!user.senha) {
          throw new Error("Senha não configurada para este usuário");
        }

        const senhaCorreta = await compare(credentials.password, user.senha);
        if (!senhaCorreta) {
          throw new Error("Senha incorreta");
        }

        return {
          id: String(user.id),
          nome: user.nome,
          email: user.email,
          saldo: user.saldo ? Number(user.saldo) : 0,
          valorInvestido: user.valorInvestido ? Number(user.valorInvestido) : 0,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.nome = user.nome as string;
        token.email = user.email as string;
        token.saldo = user.saldo as number;
        token.valorInvestido = user.valorInvestido as number;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nome = token.nome as string;
        session.user.email = token.email as string;
        session.user.saldo = token.saldo as number;
        session.user.valorInvestido = token.valorInvestido as number;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
