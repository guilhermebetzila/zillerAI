import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import formidable, { File, Fields, Files } from "formidable";
import fs from "fs";
import path from "path";

// 🚨 Desativa o bodyParser padrão do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função para lidar com form-data usando Promise
const parseForm = (req: Request): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req as any, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req);

    const userId = fields.userId?.toString();

    // 🔹 Tratamento seguro para File ou File[]
    let file: File | undefined;
    if (Array.isArray(files.file)) {
      file = files.file[0];
    } else {
      file = files.file as File | undefined;
    }

    if (!userId || !file) {
      return NextResponse.json(
        { error: "userId e arquivo são obrigatórios" },
        { status: 400 }
      );
    }

    // 📂 Pasta onde será salvo
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // 🖼️ Nome único para o arquivo
    const newFileName = `user-${userId}-${Date.now()}${path.extname(file.originalFilename || "")}`;
    const newFilePath = path.join(uploadsDir, newFileName);

    // Move o arquivo para a pasta uploads
    fs.renameSync(file.filepath, newFilePath);

    // URL pública
    const photoUrl = `/uploads/${newFileName}`;

    // Atualiza no banco
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { photoUrl },
      select: { id: true, nome: true, email: true, photoUrl: true },
    });

    return NextResponse.json({
      success: true,
      message: "Foto de perfil enviada e salva com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao salvar imagem:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar imagem" },
      { status: 500 }
    );
  }
}
