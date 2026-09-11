import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const usuario = await getCurrentUser();
    if (!usuario) {
      return NextResponse.json({ usuario: null }, { status: 401 });
    }

    return NextResponse.json({ usuario });
  } catch (error) {
    return NextResponse.json({ usuario: null }, { status: 500 });
  }
}
