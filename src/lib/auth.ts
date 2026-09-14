import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "jusc-chave-secreta-padrao-2026";
export const AUTH_COOKIE_NAME = "jusc_auth_token";

export interface TokenPayload {
  userId: string;
  login: string;
  email?: string | null;
  nome: string;
  perfil: "ADMIN" | "COLABORADOR" | "TESOUREIRO";
  primeiroAcesso?: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.usuario.findUnique({
    where: { id: session.userId },
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

  if (!user || user.status !== "ATIVO") return null;
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.perfil !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireTesoureiroOrAdmin() {
  const user = await requireAuth();
  if (user.perfil !== "ADMIN" && user.perfil !== "TESOUREIRO") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
