import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, Camera, ClipboardList, BookOpen, ChevronRight, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function PatientsPage() {
  const session = await auth()
  const nutritionistId = session!.user.id

  const patientLinks = await prisma.patientNutritionist.findMany({
    where: { nutritionistId },
    include: {
      patient: {
        include: {
          mealLogs: { orderBy: { loggedAt: "desc" }, take: 1 },
          diaryEntries: { orderBy: { date: "desc" }, take: 1 },
          dailyQuiz: { orderBy: { date: "desc" }, take: 1 },
          badges: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const patients = patientLinks.map((pl: (typeof patientLinks)[number]) => pl.patient)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">{patients.length} paciente{patients.length !== 1 ? "s" : ""} vinculado{patients.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/nutritionist/patients/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <UserPlus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Novo Paciente</span>
          </Button>
        </Link>
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum paciente vinculado ainda.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {patients.map((patient) => {
            const lastMeal = patient.mealLogs[0]
            const lastQuiz = patient.dailyQuiz[0]
            const lastDiary = patient.diaryEntries[0]

            return (
              <Link key={patient.id} href={`/dashboard/nutritionist/patients/${patient.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-base md:text-lg font-bold text-teal-700">
                            {patient.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{patient.name}</p>
                          <p className="text-sm text-gray-500 truncate hidden sm:block">{patient.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {patient.badges.length} conquista{patient.badges.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:gap-6 text-sm text-gray-500 flex-shrink-0">
                        <div className="text-center hidden sm:block">
                          <div className="flex items-center gap-1 justify-center mb-0.5">
                            <Camera className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-900">
                              {lastMeal ? format(new Date(lastMeal.loggedAt), "dd/MM", { locale: ptBR }) : "—"}
                            </span>
                          </div>
                          <p className="text-xs">última refeição</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 justify-center mb-0.5">
                            <ClipboardList className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-gray-900">
                              {lastQuiz ? lastQuiz.dailyNote.toFixed(1) : "—"}
                            </span>
                          </div>
                          <p className="text-xs">quiz</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <div className="flex items-center gap-1 justify-center mb-0.5">
                            <BookOpen className="w-4 h-4 text-pink-500" />
                            <span className="font-medium text-gray-900">
                              {lastDiary ? format(new Date(lastDiary.date), "dd/MM", { locale: ptBR }) : "—"}
                            </span>
                          </div>
                          <p className="text-xs">diário</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
