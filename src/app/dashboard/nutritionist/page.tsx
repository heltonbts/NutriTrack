import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  Camera,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardHeader from "@/components/DashboardHeader";
import { AnimatedStatsContainer, AnimatedStatItem } from "@/components/AnimatedStats";
import { getSaoPauloQuizDate } from "@/lib/timezone";

export default async function NutritionistDashboard() {
  const session = await auth();
  const nutritionistId = session!.user.id;
  const today = new Date();
  const todayQuizDate = getSaoPauloQuizDate();

  const nutri = await prisma.user.findUnique({
    where: { id: nutritionistId },
    select: { name: true, image: true },
  });

  const patientLinks = await prisma.patientNutritionist.findMany({
    where: { nutritionistId },
    include: {
      patient: {
        include: {
          mealLogs: {
            where: {
              loggedAt: { gte: startOfDay(today), lte: endOfDay(today) },
            },
            include: { comments: true },
          },
          diaryEntries: {
            where: { date: { gte: startOfDay(today), lte: endOfDay(today) } },
            include: { comments: true },
          },
          dailyQuiz: {
            where: { date: todayQuizDate },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // 1. Extraindo os tipos diretamente da resposta do Prisma
  type PatientWithData = (typeof patientLinks)[number]["patient"];
  type MealLog = PatientWithData["mealLogs"][number];
  type DiaryEntry = PatientWithData["diaryEntries"][number];

  const patients: PatientWithData[] = patientLinks.map(
    (pl: (typeof patientLinks)[number]) => pl.patient,
  );

  const totalPatients = patients.length;
  const activeToday = patients.filter(
    (p: (typeof patients)[number]) =>
      p.mealLogs.length > 0 ||
      p.diaryEntries.length > 0 ||
      p.dailyQuiz.length > 0,
  ).length;

  // 2. Aplicando as tipagens nos callbacks de filter
  const pendingMealComments = patients.reduce((acc: number, p: (typeof patients)[number]) => {
    return (
      acc + p.mealLogs.filter((m: (typeof p.mealLogs)[number]) => m.comments.length === 0).length
    );
  }, 0);

  const pendingDiaryComments = patients.reduce((acc: number, p: (typeof patients)[number]) => {
    return (
      acc +
      p.diaryEntries.filter((d: (typeof p.diaryEntries)[number]) => d.comments.length === 0).length
    );
  }, 0);

  const pendingQuizFeedback = patients.filter(
    (p: (typeof patients)[number]) => p.dailyQuiz.length > 0 && !p.dailyQuiz[0].nutritionistFeedback,
  ).length;

  const totalPending =
    pendingMealComments + pendingDiaryComments + pendingQuizFeedback;

  return (
    <div className="space-y-6">
      <DashboardHeader
        name={nutri?.name ?? session!.user.name ?? null}
        image={nutri?.image ?? null}
        subtitle={format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
        settingsHref="/dashboard/nutritionist/settings"
      />

      {/* Stats */}
      <AnimatedStatsContainer>
        <AnimatedStatItem>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPatients}
                  </p>
                  <p className="text-sm text-gray-500">Pacientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedStatItem>

        <AnimatedStatItem>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeToday}
                  </p>
                  <p className="text-sm text-gray-500">Ativos hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedStatItem>

        <AnimatedStatItem>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPending}
                  </p>
                  <p className="text-sm text-gray-500">Pendências</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedStatItem>

        <AnimatedStatItem>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingQuizFeedback}
                  </p>
                  <p className="text-sm text-gray-500">Quiz sem retorno</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedStatItem>
      </AnimatedStatsContainer>

      {/* Patient list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seus Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {patients.length === 0 ? (
            <p className="text-gray-500 text-sm p-6">
              Nenhum paciente vinculado ainda.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {patients.map((patient) => {
                const mealsToday = patient.mealLogs.length;
                const quizToday = patient.dailyQuiz[0];

                // 3. Aplicando as tipagens aqui também
                const pendingPatient =
                  patient.mealLogs.filter(
                    (m: MealLog) => m.comments.length === 0,
                  ).length +
                  patient.diaryEntries.filter(
                    (d: DiaryEntry) => d.comments.length === 0,
                  ).length +
                  (quizToday && !quizToday.nutritionistFeedback ? 1 : 0);

                return (
                  <li key={patient.id}>
                    <Link
                      href={`/dashboard/nutritionist/patients/${patient.id}`}
                      className="flex items-center justify-between px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-teal-700">
                            {patient.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate hidden sm:block">
                            {patient.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-500 shrink-0">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {mealsToday} hoje
                          </span>
                          <span className="sm:hidden">{mealsToday}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5" />
                          {quizToday
                            ? `${quizToday.dailyNote.toFixed(1)}`
                            : "—"}
                        </span>
                        {pendingPatient > 0 && (
                          <span className="bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                            {pendingPatient}
                            <span className="hidden md:inline">
                              {" "}
                              pendente{pendingPatient > 1 ? "s" : ""}
                            </span>
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
