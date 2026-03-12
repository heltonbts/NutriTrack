import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

  const patient = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "PATIENT",
    },
  })

  await prisma.patientNutritionist.create({
    data: {
      patientId: patient.id,
      nutritionistId: session.user.id,
    },
  })

  return NextResponse.json({ id: patient.id, name: patient.name, email: patient.email })
}
