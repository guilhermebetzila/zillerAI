// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Cria o diretório /public/uploads se não existir
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    // Converte para buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `user-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    // Salva no disco
    await writeFile(filePath, buffer);

    // Retorna a URL acessível
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Erro upload:", error);
    return NextResponse.json({ error: "Erro ao enviar arquivo" }, { status: 500 });
  }
}
