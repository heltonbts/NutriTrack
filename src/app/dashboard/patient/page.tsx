import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import DailyOverview from "@/components/patient/DailyOverview"
import QuickActions from "@/components/patient/QuickActions"
import RecentMeals from "@/components/patient/RecentMeals"
import WeeklyProgress from "@/components/patient/WeeklyProgress"
import DashboardHeader from "@/components/DashboardHeader"

export default async function PatientDashboard() {
  const session = await auth()
  const userId = session!.user.id

  const today = new Date()

  const [user, todayMeals, todayQuiz, recentQuizzes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    }),
    prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      },
      orderBy: { loggedAt: "desc" },
      take: 5,
    }),
    prisma.dailyQuiz.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      }
    }),
    prisma.dailyQuiz.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
    }),
  ])

  return (
    <div className="space-y-6">
      <DashboardHeader
        name={user?.name ?? session!.user.name ?? null}
        image={user?.image ?? null}
        subtitle={format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
        settingsHref="/dashboard/patient/settings"
      />

      <QuickActions hasQuizToday={!!todayQuiz} mealCount={todayMeals.length} />
      <DailyOverview todayQuiz={todayQuiz} todayMeals={todayMeals} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentMeals meals={todayMeals} />
        <WeeklyProgress quizzes={recentQuizzes} />
      </div>
    </div>
  )
}
