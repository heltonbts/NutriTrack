"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"

export default function MealCommentForm({
  mealId,
  hasComment,
}: {
  mealId: string
  hasComment: boolean
}) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit() {
    if (!content.trim()) return
    setLoading(true)
    await fetch("/api/nutritionist/meal-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealId, content }),
    })
    setLoading(false)
    setContent("")
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
      >
        <MessageSquare className="w-4 h-4" />
        {hasComment ? "Adicionar outro comentário" : "Comentar"}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Escreva seu comentário para o paciente..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={loading || !content.trim()}>
          {loading ? "Enviando..." : "Enviar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
