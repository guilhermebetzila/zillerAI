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
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          throw new Error("Preencha todos os campos");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.senha) {
          throw new Error("Email não encontrado");
        }

        const senhaCorreta = await compare(credentials.senha, user.senha);
        if (!senhaCorreta) {
          throw new Error("Senha incorreta");
        }

        // ✅ Corrigido: garante que saldo seja number (ou 0)
        return {
          id: String(user.id),
          nome: user.nome,
          email: user.email,
          saldo: user.saldo ? Number(user.saldo) : 0,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.nome = (user as any).nome;
        token.email = user.email;
        token.saldo = (user as any).saldo;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nome = token.nome as string;
        session.user.email = token.email as string;
        session.user.saldo = token.saldo as number;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias de sessão
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias para o token JWT
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
