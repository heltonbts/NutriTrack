import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { entryId, content } = await req.json()
  if (!entryId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const entry = await prisma.diaryEntry.findUnique({
    where: { id: entryId },
    select: { userId: true },
  })
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const link = await prisma.patientNutritionist.findUnique({
    where: {
      patientId_nutritionistId: {
        patientId: entry.userId,
        nutritionistId: session.user.id,
      },
    },
  })
  if (!link) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const comment = await prisma.diaryComment.create({
    data: { diaryEntryId: entryId, authorId: session.user.id, content },
  })

  return NextResponse.json(comment)
}
