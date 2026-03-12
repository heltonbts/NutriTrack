"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"

export default function QuizFeedbackForm({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit() {
    if (!content.trim()) return
    setLoading(true)
    await fetch("/api/nutritionist/quiz-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, feedback: content }),
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
        Dar feedback
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Escreva seu feedback para o paciente sobre este dia..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={loading || !content.trim()}>
          {loading ? "Enviando..." : "Enviar feedback"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
