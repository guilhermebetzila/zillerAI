import { PrismaClient } from "@prisma/client";

export const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL, // ex: "file:./dev.db" para SQLite
    },
  },
});

export const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // ex: Postgres no Vercel ou outro
    },
  },
});
