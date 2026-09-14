import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const usuarios = await prisma.usuario.findMany({
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        nome: true,
        login: true,
        email: true,
        perfil: true,
        status: true,
        primeiroAcesso: true,
        criadoEm: true,
      },
    });

    return NextResponse.json({ usuarios });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminLogado = await requireAdmin();
    const body = await req.json();

    const { nome, login, email, senha, perfil } = body;

    if (!nome || !login || !senha) {
      return NextResponse.json(
        { error: "Informe nome, nome de usuário (login) e senha para o novo usuário." },
        { status: 400 }
      );
    }

    const loginFormatado = login.toLowerCase().trim();
    const existeLogin = await prisma.usuario.findUnique({
      where: { login: loginFormatado },
    });

    if (existeLogin) {
      return NextResponse.json(
        { error: "Já existe um usuário cadastrado com este login." },
        { status: 400 }
      );
    }

    let emailFormatado = null;
    if (email && email.trim()) {
      emailFormatado = email.toLowerCase().trim();
      const existeEmail = await prisma.usuario.findFirst({
        where: { email: emailFormatado },
      });
      if (existeEmail) {
        return NextResponse.json(
          { error: "Já existe um usuário cadastrado com este e-mail." },
          { status: 400 }
        );
      }
    }

    const senhaHash = await hashPassword(senha);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        login: loginFormatado,
        email: emailFormatado,
        senhaHash,
        perfil: perfil === "ADMIN" ? "ADMIN" : perfil === "TESOUREIRO" ? "TESOUREIRO" : "COLABORADOR",
        status: "ATIVO",
        primeiroAcesso: true,
      },
      select: {
        id: true,
        nome: true,
        login: true,
        email: true,
        perfil: true,
        status: true,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: adminLogado.id,
        acao: "CRIAR_USUARIO",
        detalhes: `Criou usuário ${novoUsuario.nome} (${novoUsuario.email}) com perfil ${novoUsuario.perfil}`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, usuario: novoUsuario });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao criar usuário." }, { status: 500 });
  }
}
