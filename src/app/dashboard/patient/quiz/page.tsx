"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const questions = [
  { key: "dietScore", label: "Como foi sua alimentação hoje?", emoji: "🥗", invertedScale: false },
  { key: "hungerControl", label: "Como esteve seu controle da fome?", emoji: "🍽️", invertedScale: false },
  { key: "anxietyScore", label: "Como esteve sua ansiedade?", emoji: "😰", invertedScale: true },
  { key: "planAdherence", label: "Você conseguiu seguir o planejado?", emoji: "✅", invertedScale: false },
  { key: "hydration", label: "Como foi sua hidratação?", emoji: "💧", invertedScale: false },
  { key: "sleepScore", label: "Como foi seu sono?", emoji: "😴", invertedScale: false },
  { key: "snackUrge", label: "Como esteve sua vontade de beliscar?", emoji: "🍪", invertedScale: true },
  { key: "generalScore", label: "Como você avalia seu dia de forma geral?", emoji: "⭐", invertedScale: false },
]

const positiveColors = [
  "bg-red-500", "bg-red-400", "bg-orange-400", "bg-orange-300",
  "bg-yellow-400", "bg-yellow-300", "bg-lime-400", "bg-green-400",
  "bg-green-500", "bg-emerald-600", "bg-emerald-700"
]
const invertedColors = [
  "bg-emerald-700", "bg-emerald-600", "bg-green-500", "bg-green-400",
  "bg-lime-400", "bg-yellow-300", "bg-yellow-400", "bg-orange-300",
  "bg-orange-400", "bg-red-400", "bg-red-500"
]

function ScoreButton({ value, selected, onClick, inverted }: { value: number; selected: boolean; onClick: () => void; inverted: boolean }) {
  const colors = inverted ? invertedColors : positiveColors
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
        selected
          ? `${colors[value]} text-white scale-110 shadow-md`
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {value}
    </button>
  )
}

export default function QuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [dailyNote, setDailyNote] = useState<number | null>(null)
  const [newBadges, setNewBadges] = useState<{ id: string; name: string; icon: string }[]>([])

  function setScore(key: string, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  const allAnswered = questions.every((q) => scores[q.key] !== undefined)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allAnswered) return
    setLoading(true)

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scores),
    })

    if (res.ok) {
      const data = await res.json()
      setDailyNote(data.dailyNote)
      setNewBadges(data.newBadges ?? [])
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted && dailyNote !== null) {
    const getFeedback = (note: number) => {
      if (note >= 8) return { msg: "Dia excelente! Você está no caminho certo. Continue assim! 🎉", color: "text-green-600" }
      if (note >= 6) return { msg: "Bom dia! Alguns pontos para melhorar, mas você está progredindo. 💪", color: "text-yellow-600" }
      return { msg: "Dia desafiador, mas amanhã é uma nova oportunidade. Vá dormir cedo e se hidrate bem. 🌙", color: "text-orange-600" }
    }
    const feedback = getFeedback(dailyNote)

    return (
      <div className="max-w-xl mx-auto">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="text-6xl mb-4">
              {dailyNote >= 8 ? "🌟" : dailyNote >= 6 ? "😊" : "💙"}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nota do Dia</h2>
            <div className="text-6xl font-bold mb-2">
              <span className={feedback.color}>{dailyNote.toFixed(1)}</span>
              <span className="text-gray-300 text-3xl">/10</span>
            </div>
            <p className={`text-base mt-4 font-medium ${feedback.color}`}>{feedback.msg}</p>

            {newBadges.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm font-semibold text-yellow-800 mb-3">
                  🎉 Conquista{newBadges.length > 1 ? "s" : ""} desbloqueada{newBadges.length > 1 ? "s" : ""}!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {newBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-2 bg-white border border-yellow-300 rounded-lg px-3 py-2">
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-sm font-medium text-gray-800">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="mt-8 bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/dashboard/patient")}
            >
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Questionário Diário</h1>
        <p className="text-gray-500">Avalie seu dia de 0 a 10 em cada área</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q) => (
          <Card key={q.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span>{q.emoji}</span>
                <span className="flex-1">{q.label}</span>
                {q.invertedScale && (
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    menor = melhor
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 11 }, (_, i) => (
                  <ScoreButton
                    key={i}
                    value={i}
                    selected={scores[q.key] === i}
                    onClick={() => setScore(q.key, i)}
                    inverted={q.invertedScale}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={!allAnswered || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculando...
            </>
          ) : (
            `Enviar Avaliação ${allAnswered ? "✓" : `(${Object.keys(scores).length}/${questions.length})`}`
          )}
        </Button>
      </form>
    </div>
  )
}
