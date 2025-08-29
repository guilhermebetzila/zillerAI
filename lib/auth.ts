// lib/auth.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

// Tipo do usuário que vamos retornar para a sessão
type AuthUser = {
  id: string;            // string, pois NextAuth espera id como string
  email: string;
  nome: string;
  saldo: number;
  valorInvestido: number;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        // Busca o usuário pelo email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // Verifica a senha usando bcrypt
        const isValid = await bcrypt.compare(credentials.senha, user.senha);
        if (!isValid) return null;

        // Retorna somente os campos que vamos usar na sessão
        const authUser: AuthUser = {
          id: String(user.id), // converte number para string
          email: user.email,
          nome: user.nome,
          saldo: Number(user.saldo),
          valorInvestido: Number(user.valorInvestido),
        };

        return authUser;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nome = user.nome;
        token.saldo = user.saldo;
        token.valorInvestido = user.valorInvestido;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          nome: token.nome as string,
          saldo: token.saldo as number,
          valorInvestido: token.valorInvestido as number,
        };
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
