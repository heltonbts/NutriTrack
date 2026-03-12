import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkAndAwardBadges } from "@/lib/badges"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { content, mood } = await req.json()

  const entry = await prisma.diaryEntry.create({
    data: {
      userId: session.user.id,
      content,
      mood: mood || null,
    }
  })

  const newBadges = await checkAndAwardBadges(session.user.id)
  return NextResponse.json({ ...entry, newBadges })
}
