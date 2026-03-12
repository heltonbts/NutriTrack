import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { quizId, feedback } = await req.json()
  if (!quizId || !feedback?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const quiz = await prisma.dailyQuiz.findUnique({
    where: { id: quizId },
    select: { userId: true },
  })
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const link = await prisma.patientNutritionist.findUnique({
    where: {
      patientId_nutritionistId: {
        patientId: quiz.userId,
        nutritionistId: session.user.id,
      },
    },
  })
  if (!link) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.dailyQuiz.update({
    where: { id: quizId },
    data: { nutritionistFeedback: feedback, feedbackAt: new Date() },
  })

  return NextResponse.json(updated)
}
