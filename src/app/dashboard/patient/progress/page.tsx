import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import ProgressCharts from "@/components/patient/ProgressCharts"

export default async function ProgressPage() {
  const session = await auth()
  const userId = session!.user.id

  const quizzes = await prisma.dailyQuiz.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take: 30,
  })

  const totalMeals = await prisma.mealLog.count({ where: { userId } })
  const totalWorkouts = await prisma.workoutLog.count({ where: { userId } })
  const totalDiaries = await prisma.diaryEntry.count({ where: { userId } })
  const totalQuizzes = await prisma.dailyQuiz.count({ where: { userId } })

  const avgNote = quizzes.length
    ? quizzes.reduce((a: number, b: (typeof quizzes)[number]) => a + b.dailyNote, 0) / quizzes.length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Evolução</h1>
        <p className="text-gray-500">Acompanhe seu progresso ao longo do tempo</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: "Refeições registradas", value: totalMeals, emoji: "🍽️" },
          { label: "Treinos registrados", value: totalWorkouts, emoji: "🏋️" },
          { label: "Relatos no diário", value: totalDiaries, emoji: "📔" },
          { label: "Questionários respondidos", value: totalQuizzes, emoji: "✅" },
          { label: "Nota média", value: avgNote.toFixed(1), emoji: "⭐" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl mb-1">{stat.emoji}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProgressCharts quizzes={quizzes} />
    </div>
  )
}
