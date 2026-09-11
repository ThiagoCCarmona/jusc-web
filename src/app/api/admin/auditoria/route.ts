import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const logs = await prisma.logAuditoria.findMany({
      orderBy: { criadoEm: "desc" },
      take: 50,
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
}
