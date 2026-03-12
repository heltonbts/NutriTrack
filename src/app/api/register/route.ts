import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, password: hashed, role: "NUTRITIONIST" },
  })

  return NextResponse.json({ ok: true })
}
