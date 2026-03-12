import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DailyOverviewProps {
  todayQuiz: any
  todayMeals: any[]
}

const quizLabels: Record<string, string> = {
  dietScore: "Alimentação",
  hungerControl: "Controle da Fome",
  anxietyScore: "Ansiedade",
  planAdherence: "Adesão ao Plano",
  hydration: "Hidratação",
  sleepScore: "Sono",
  snackUrge: "Vontade de Beliscar",
  generalScore: "Avaliação Geral",
}

export default function DailyOverview({ todayQuiz, todayMeals }: DailyOverviewProps) {
  if (!todayQuiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nota do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-gray-500 text-sm">Você ainda não respondeu o questionário de hoje.</p>
            <a href="/dashboard/patient/quiz" className="text-green-600 text-sm font-medium hover:underline mt-2 inline-block">
              Responder agora →
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  const scores = [
    { key: "dietScore", value: todayQuiz.dietScore },
    { key: "hungerControl", value: todayQuiz.hungerControl },
    { key: "anxietyScore", value: todayQuiz.anxietyScore },
    { key: "planAdherence", value: todayQuiz.planAdherence },
    { key: "hydration", value: todayQuiz.hydration },
    { key: "sleepScore", value: todayQuiz.sleepScore },
    { key: "snackUrge", value: todayQuiz.snackUrge },
    { key: "generalScore", value: todayQuiz.generalScore },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Nota do Dia</CardTitle>
        <div className="text-right">
          <span className="text-3xl font-bold text-green-600">{todayQuiz.dailyNote.toFixed(1)}</span>
          <span className="text-gray-400 text-sm">/10</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {scores.map(({ key, value }) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{quizLabels[key]}</span>
                <span className="font-medium">{value}/10</span>
              </div>
              <Progress value={value * 10} className="h-2" />
            </div>
          ))}
        </div>
        {todayQuiz.nutritionistFeedback && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-medium text-green-700 mb-1">Feedback da Nutricionista:</p>
            <p className="text-sm text-gray-700">{todayQuiz.nutritionistFeedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
