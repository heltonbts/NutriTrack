import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()

  const reminders = await prisma.reminder.findMany({
    where: {
      patientId: session.user.id,
      endDate: {
        gte: now,
      },
    },
    orderBy: {
      endDate: "asc",
    },
  })

  return NextResponse.json(reminders)
}
