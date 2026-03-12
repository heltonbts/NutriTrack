import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import DailyOverview from "@/components/patient/DailyOverview"
import QuickActions from "@/components/patient/QuickActions"
import RecentMeals from "@/components/patient/RecentMeals"
import WeeklyProgress from "@/components/patient/WeeklyProgress"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedStatItem, AnimatedStatsContainer } from "@/components/AnimatedStats"
import DashboardHeader from "@/components/DashboardHeader"
import { getSaoPauloQuizDate } from "@/lib/timezone"
import { Trophy, TrendingUp } from "lucide-react"

export default async function PatientDashboard() {
  const session = await auth()
  const userId = session!.user.id

  const today = new Date()
  const todayQuizDate = getSaoPauloQuizDate()

  const [user, todayMeals, todayWorkouts, todayQuiz, recentQuizzes, badgeCount] = await Promise.all([
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
    prisma.workoutLog.findMany({
      where: {
        userId,
        performedAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      },
      orderBy: { performedAt: "desc" },
      take: 5,
    }),
    prisma.dailyQuiz.findFirst({
      where: {
        userId,
        date: todayQuizDate,
      }
    }),
    prisma.dailyQuiz.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
    }),
    prisma.userBadge.count({
      where: { userId },
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

      <AnimatedStatsContainer className="space-y-6">
        <AnimatedStatItem>
          <QuickActions
            hasQuizToday={!!todayQuiz}
            mealCount={todayMeals.length}
            workoutCount={todayWorkouts.length}
          />
        </AnimatedStatItem>
        <AnimatedStatItem>
          <DailyOverview todayQuiz={todayQuiz} todayMeals={todayMeals} />
        </AnimatedStatItem>
      </AnimatedStatsContainer>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/patient/progress">
          <Card className="border-0 bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-700 font-medium">Evolução</p>
                <p className="text-xs text-gray-500 mt-1">
                  Veja seu progresso e sua nota média.
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/patient/badges">
          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Conquistas</p>
                <p className="text-xs text-gray-500 mt-1">
                  {badgeCount} desbloqueada{badgeCount !== 1 ? "s" : ""} ate agora.
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentMeals meals={todayMeals} />
        <WeeklyProgress quizzes={recentQuizzes} />
      </div>
    </div>
  )
}
