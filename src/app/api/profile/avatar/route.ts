import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const photo = formData.get("photo") as File | null

  if (!photo || photo.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const bytes = await photo.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = photo.name.split(".").pop() ?? "jpg"
  const fileName = `avatars/${session.user.id}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from("nutritrack")
    .upload(fileName, buffer, { contentType: photo.type, upsert: true })

  if (error) {
    console.error("[avatar] upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from("nutritrack").getPublicUrl(fileName)
  // Bust cache with timestamp
  const imageUrl = `${data.publicUrl}?t=${Date.now()}`

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  })

  return NextResponse.json({ imageUrl })
}
