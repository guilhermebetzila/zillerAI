import { PrismaClient } from "@prisma/client";

export const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL, // banco local
    },
  },
});

export const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.REMOTE_DATABASE_URL, // banco remoto
    },
  },
});
