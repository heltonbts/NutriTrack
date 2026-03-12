import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const photo = formData.get("photo") as File | null;
  const activityType = formData.get("activityType") as string;
  const feeling = formData.get("feeling") as string;
  const notes = formData.get("notes") as string;
  const checkedIn = formData.get("checkedIn") === "true";

  let photoUrl: string | null = null;

  if (photo && photo.size > 0) {
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `workouts/${session.user.id}/${Date.now()}-${photo.name}`;

    const { error } = await supabaseAdmin.storage
      .from("nutritrack")
      .upload(fileName, buffer, { contentType: photo.type });

    if (error) {
      console.error("[workouts] Supabase upload error:", error);
    } else {
      const { data } = supabaseAdmin.storage
        .from("nutritrack")
        .getPublicUrl(fileName);
      photoUrl = data.publicUrl;
    }
  }

  const workout = await prisma.workoutLog.create({
    data: {
      userId: session.user.id,
      photoUrl,
      activityType: activityType as
        | "WALK"
        | "RUN"
        | "BIKE"
        | "GYM"
        | "STRENGTH"
        | "HIIT"
        | "YOGA"
        | "PILATES"
        | "SWIMMING"
        | "SPORTS"
        | "OTHER",
      feeling: feeling || null,
      notes: notes || null,
      checkedIn,
    },
  });

  return NextResponse.json(workout);
}
