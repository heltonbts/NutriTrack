import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  BookOpen,
  ClipboardList,
  Dumbbell,
  Trophy,
  TrendingUp,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientEvolutionPanel from "@/components/nutritionist/PatientEvolutionPanel";
import { getSaoPauloQuizDate } from "@/lib/timezone";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const session = await auth();
  const nutritionistId = session!.user.id;

  // Verify this patient belongs to this nutritionist
  const link = await prisma.patientNutritionist.findUnique({
    where: { patientId_nutritionistId: { patientId, nutritionistId } },
  });
  if (!link) notFound();
  const todayQuizDate = getSaoPauloQuizDate();

  const [patient, quizzes, recentMeals, recentDiary, recentWorkouts, badges] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: patientId } }),
      prisma.dailyQuiz.findMany({
        where: { userId: patientId },
        orderBy: { date: "desc" },
        take: 14,
      }),
      prisma.mealLog.findMany({
        where: { userId: patientId },
        orderBy: { loggedAt: "desc" },
        take: 5,
        include: { comments: true },
      }),
      prisma.diaryEntry.findMany({
        where: { userId: patientId },
        orderBy: { date: "desc" },
        take: 3,
        include: { comments: true },
      }),
      prisma.workoutLog.findMany({
        where: { userId: patientId },
        orderBy: { performedAt: "desc" },
        take: 5,
      }),
      prisma.userBadge.findMany({
        where: { userId: patientId },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      }),
    ]);

  if (!patient) notFound();

  const todayQuiz = quizzes.find(
    (q: (typeof quizzes)[number]) =>
      new Date(q.date).getTime() === todayQuizDate.getTime(),
  );

  const avgNote =
    quizzes.length > 0
      ? (
          quizzes.reduce(
            (s: number, q: (typeof quizzes)[number]) => s + q.dailyNote,
            0,
          ) / quizzes.length
        ).toFixed(1)
      : null;

  const pendingMeals = recentMeals.filter(
    (m: (typeof recentMeals)[number]) => m.comments.length === 0,
  ).length;
  const pendingDiary = recentDiary.filter(
    (d: (typeof recentDiary)[number]) => d.comments.length === 0,
  ).length;
  const pendingWorkouts = recentWorkouts.filter(
    (workout: (typeof recentWorkouts)[number]) => !workout.nutritionistFeedback,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/nutritionist/patients"
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-500">{patient.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {avgNote ?? "—"}
                </p>
                <p className="text-sm text-gray-500">Média geral</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {recentMeals.length}
                </p>
                <p className="text-sm text-gray-500">Refeições rec.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {recentWorkouts.length}
                </p>
                <p className="text-sm text-gray-500">Treinos rec.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {badges.length}
                </p>
                <p className="text-sm text-gray-500">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.length}
                </p>
                <p className="text-sm text-gray-500">Quizzes feitos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's quiz */}
      {todayQuiz && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Questionário de hoje</span>
              <span className="text-2xl font-bold text-teal-600">
                {todayQuiz.dailyNote.toFixed(1)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "Alimentação", value: todayQuiz.dietScore },
                { label: "Fome", value: todayQuiz.hungerControl },
                { label: "Ansiedade", value: todayQuiz.anxietyScore },
                { label: "Planejamento", value: todayQuiz.planAdherence },
                { label: "Hidratação", value: todayQuiz.hydration },
                { label: "Sono", value: todayQuiz.sleepScore },
                { label: "Beliscar", value: todayQuiz.snackUrge },
                { label: "Geral", value: todayQuiz.generalScore },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 rounded-lg p-3 text-center"
                >
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            {todayQuiz.nutritionistFeedback ? (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-xs font-medium text-teal-700 mb-1">
                  Seu feedback
                </p>
                <p className="text-sm text-teal-900">
                  {todayQuiz.nutritionistFeedback}
                </p>
              </div>
            ) : (
              <Link
                href={`/dashboard/nutritionist/patients/${patientId}/quiz`}
                className="block text-center text-sm font-medium text-teal-600 hover:text-teal-700 py-2 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
              >
                Adicionar feedback ao quiz
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <Link href={`/dashboard/nutritionist/patients/${patientId}/meals`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Refeições</p>
                    {pendingMeals > 0 && (
                      <p className="text-xs text-orange-600">
                        {pendingMeals} sem comentário
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/nutritionist/patients/${patientId}/diary`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Diário</p>
                    {pendingDiary > 0 && (
                      <p className="text-xs text-orange-600">
                        {pendingDiary} sem comentário
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/nutritionist/patients/${patientId}/workouts`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Treinos</p>
                    {pendingWorkouts > 0 ? (
                      <p className="text-xs text-orange-600">
                        {pendingWorkouts} sem feedback
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        {recentWorkouts.length} registros
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/nutritionist/patients/${patientId}/quiz`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Questionários</p>
                    <p className="text-xs text-gray-500">
                      {quizzes.length} registros
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <PatientEvolutionPanel quizzes={quizzes} badges={badges} />

      {/* Recent badges */}
      {badges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conquistas recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((ub: (typeof badges)[number]) => (
                <div
                  key={ub.id}
                  className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2"
                >
                  <span className="text-lg">{ub.badge.icon}</span>
                  <span className="text-sm font-medium text-yellow-800">
                    {ub.badge.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
