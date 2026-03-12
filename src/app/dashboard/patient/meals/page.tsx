import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: "Café da manhã",
  MORNING_SNACK: "Lanche da manhã",
  LUNCH: "Almoço",
  AFTERNOON_SNACK: "Lanche da tarde",
  DINNER: "Jantar",
  SUPPER: "Ceia",
  OTHER: "Outro",
}

export default async function MealsPage() {
  const session = await auth()
  const userId = session!.user.id
  const today = new Date()

  const meals = await prisma.mealLog.findMany({
    where: {
      userId,
      loggedAt: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      }
    },
    include: { comments: true },
    orderBy: { loggedAt: "desc" },
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Refeições</h1>
          <p className="text-gray-500 text-sm">
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Link href="/dashboard/patient/meals/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Registrar Refeição</span>
          </Button>
        </Link>
      </div>

      {meals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-gray-500">Nenhuma refeição registrada hoje.</p>
            <Link href="/dashboard/patient/meals/new">
              <Button className="mt-4 bg-green-600 hover:bg-green-700">
                Registrar primeira refeição
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meals.map((meal: any) => (
            <Card key={meal.id} className="overflow-hidden">
              {/* Photo — full width */}
              {meal.photoUrl ? (
                <div className="relative w-full h-56 sm:h-72">
                  <Image src={meal.photoUrl} alt="Refeição" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <span className="text-5xl">🍽️</span>
                </div>
              )}

              <CardContent className="p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    {mealTypeLabels[meal.mealType]}
                  </span>
                  <p className="text-xs text-gray-400">
                    {format(new Date(meal.loggedAt), "HH:mm")}
                  </p>
                </div>

                {meal.caption && (
                  <p className="text-sm text-gray-700">{meal.caption}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {meal.hungerBefore !== null && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Fome antes: {meal.hungerBefore}/10
                    </span>
                  )}
                  {meal.satietyAfter !== null && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Saciedade: {meal.satietyAfter}/10
                    </span>
                  )}
                  {meal.emotion && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                      {meal.emotion}
                    </span>
                  )}
                  {meal.location && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      📍 {meal.location}
                    </span>
                  )}
                </div>

                {meal.comments.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs font-medium text-green-700 mb-1">
                      Resposta da Nutricionista:
                    </p>
                    <p className="text-sm text-gray-700">
                      {meal.comments[meal.comments.length - 1].content}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
