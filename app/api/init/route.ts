// app/api/init/route.ts
import { NextResponse } from "next/server";
import { initListeners } from "../../../lib/initListeners"; // ajuste o caminho se usar alias

initListeners();

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
