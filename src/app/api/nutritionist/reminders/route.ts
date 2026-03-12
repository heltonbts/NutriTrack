import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("patientId")

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
  }

  const reminders = await prisma.reminder.findMany({
    where: {
      patientId,
      nutritionistId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(reminders)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { patientId, content, endDate } = await req.json()

  if (!patientId || !content || !endDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const reminder = await prisma.reminder.create({
    data: {
      patientId,
      nutritionistId: session.user.id,
      content,
      endDate: new Date(endDate),
    },
  })

  return NextResponse.json(reminder)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, content, endDate } = await req.json()

  if (!id || (!content && !endDate)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const updateData: any = {}
  if (content) updateData.content = content
  if (endDate) updateData.endDate = new Date(endDate)

  const reminder = await prisma.reminder.update({
    where: {
      id,
      nutritionistId: session.user.id,
    },
    data: updateData,
  })

  return NextResponse.json(reminder)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Reminder ID is required" }, { status: 400 })
  }

  await prisma.reminder.delete({
    where: {
      id,
      nutritionistId: session.user.id,
    },
  })

  return NextResponse.json({ success: true })
}
