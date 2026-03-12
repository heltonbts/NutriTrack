import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import QuizFeedbackForm from "@/components/nutritionist/QuizFeedbackForm"
import { formatInSaoPaulo } from "@/lib/timezone"

const quizFields = [
  { key: "dietScore", label: "Alimentação" },
  { key: "hungerControl", label: "Fome" },
  { key: "anxietyScore", label: "Ansiedade" },
  { key: "planAdherence", label: "Planejamento" },
  { key: "hydration", label: "Hidratação" },
  { key: "sleepScore", label: "Sono" },
  { key: "snackUrge", label: "Beliscar" },
  { key: "generalScore", label: "Geral" },
] as const

function scoreColor(score: number) {
  if (score >= 7) return "text-green-700 bg-green-50"
  if (score >= 4) return "text-yellow-700 bg-yellow-50"
  return "text-red-700 bg-red-50"
}

export default async function PatientQuizPage({
  params,
}: {
  params: Promise<{ patientId: string }>
}) {
  const { patientId } = await params
  const session = await auth()
  const nutritionistId = session!.user.id

  const link = await prisma.patientNutritionist.findUnique({
    where: { patientId_nutritionistId: { patientId, nutritionistId } },
  })
  if (!link) notFound()

  const [patient, quizzes] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId } }),
    prisma.dailyQuiz.findMany({
      where: { userId: patientId },
      orderBy: { date: "desc" },
      take: 30,
    }),
  ])

  if (!patient) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/nutritionist/patients/${patientId}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questionários</h1>
          <p className="text-gray-500">{patient.name}</p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">Nenhum questionário respondido ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz: (typeof quizzes)[number]) => (
            <Card key={quiz.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {formatInSaoPaulo(quiz.date, {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Nota do dia</span>
                    <span className={`text-lg font-bold px-2.5 py-0.5 rounded-lg ${scoreColor(quiz.dailyNote)}`}>
                      {quiz.dailyNote.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                  {quizFields.map(({ key, label }) => (
                    <div key={key} className={`rounded-lg p-2 text-center ${scoreColor(quiz[key])}`}>
                      <p className="text-xs mb-0.5 opacity-75">{label}</p>
                      <p className="text-base font-bold">{quiz[key]}</p>
                    </div>
                  ))}
                </div>

                {quiz.nutritionistFeedback ? (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-teal-700 mb-1">Seu feedback</p>
                    <p className="text-sm text-teal-900">{quiz.nutritionistFeedback}</p>
                    {quiz.feedbackAt && (
                      <p className="text-xs text-teal-500 mt-1">
                        {formatInSaoPaulo(quiz.feedbackAt, {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <QuizFeedbackForm quizId={quiz.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
