"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const moods = [
  "Ansioso(a)", "Feliz", "Triste", "Estressado(a)", "Calmo(a)",
  "Entediado(a)", "Frustrado(a)", "Motivado(a)", "Cansado(a)", "Grato(a)"
]

export default function NewDiaryPage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    const res = await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mood }),
    })

    if (res.ok) {
      router.push("/dashboard/patient/diary")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/patient/diary">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Escrever no Diário</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como você está se sentindo?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Humor atual</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um humor" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seu relato</Label>
              <Textarea
                placeholder="Como foi seu dia? O que você sentiu? Teve alguma dificuldade com a alimentação? Teve algum gatilho emocional?

Lembre: isso é confidencial entre você e sua nutricionista."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="resize-none"
              />
              <p className="text-xs text-gray-400">{content.length} caracteres</p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-brand-magenta hover:bg-brand-magenta-dark text-white"
          disabled={!content.trim() || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar no Diário"
          )}
        </Button>
      </form>
    </div>
  )
}
