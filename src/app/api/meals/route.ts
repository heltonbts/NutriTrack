import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase"
import { checkAndAwardBadges } from "@/lib/badges"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const photo = formData.get("photo") as File | null
  const caption = formData.get("caption") as string
  const mealType = formData.get("mealType") as string
  const companions = formData.get("companions") as string
  const hungerBefore = formData.get("hungerBefore") as string
  const satietyAfter = formData.get("satietyAfter") as string
  const emotion = formData.get("emotion") as string
  const location = formData.get("location") as string

  let photoUrl: string | null = null

  if (photo && photo.size > 0) {
    const bytes = await photo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `meals/${session.user.id}/${Date.now()}-${photo.name}`

    const { error } = await supabaseAdmin.storage
      .from("nutritrack")
      .upload(fileName, buffer, { contentType: photo.type })

    if (error) {
      console.error("[meals] Supabase upload error:", error)
    } else {
      const { data } = supabaseAdmin.storage.from("nutritrack").getPublicUrl(fileName)
      photoUrl = data.publicUrl
    }
  }

  const meal = await prisma.mealLog.create({
    data: {
      userId: session.user.id,
      photoUrl,
      caption: caption || null,
      mealType: mealType as any,
      companions: companions as any,
      hungerBefore: hungerBefore ? parseInt(hungerBefore) : null,
      satietyAfter: satietyAfter ? parseInt(satietyAfter) : null,
      emotion: emotion || null,
      location: location || null,
    }
  })

  const newBadges = await checkAndAwardBadges(session.user.id)
  return NextResponse.json({ ...meal, newBadges })
}
