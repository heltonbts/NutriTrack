import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "NUTRITIONIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workoutId, feedback } = await req.json();
  if (!workoutId || !feedback?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const workout = await prisma.workoutLog.findUnique({
    where: { id: workoutId },
    select: { userId: true },
  });
  if (!workout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const link = await prisma.patientNutritionist.findUnique({
    where: {
      patientId_nutritionistId: {
        patientId: workout.userId,
        nutritionistId: session.user.id,
      },
    },
  });
  if (!link) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedWorkout = await prisma.workoutLog.update({
    where: { id: workoutId },
    data: {
      nutritionistFeedback: feedback,
      feedbackAt: new Date(),
    },
  });

  return NextResponse.json(updatedWorkout);
}
