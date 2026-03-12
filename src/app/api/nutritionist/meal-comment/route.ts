import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { mealId, content } = await req.json()
  if (!mealId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Verify the meal belongs to one of this nutritionist's patients
  const meal = await prisma.mealLog.findUnique({
    where: { id: mealId },
    select: { userId: true },
  })
  if (!meal) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const link = await prisma.patientNutritionist.findUnique({
    where: {
      patientId_nutritionistId: {
        patientId: meal.userId,
        nutritionistId: session.user.id,
      },
    },
  })
  if (!link) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const comment = await prisma.mealComment.create({
    data: { mealLogId: mealId, authorId: session.user.id, content },
  })

  return NextResponse.json(comment)
}
