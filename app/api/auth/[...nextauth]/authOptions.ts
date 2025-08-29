import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs"; // ⚡ usar bcryptjs igual no register
import { prisma } from "@lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email ou CPF", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Preencha todos os campos");
        }

        const emailOrCpf = credentials.email.trim().toLowerCase();

        // 🔎 Permite login tanto por email quanto CPF
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: emailOrCpf }, { cpf: emailOrCpf }],
          },
        });

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        if (!user.senha) {
          throw new Error("Senha não configurada para este usuário");
        }

        const senhaCorreta = await compare(credentials.password, user.senha);
        if (!senhaCorreta) {
          throw new Error("Senha incorreta");
        }

        // Atualiza lastLogin
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        // ⚡ Converte Decimal para number
        return {
          id: String(user.id),
          nome: user.nome,
          email: user.email,
          saldo: Number(user.saldo ?? 0),
          valorInvestido: Number(user.valorInvestido ?? 0),
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
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
