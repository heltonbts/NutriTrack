import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: "Café da manhã",
  MORNING_SNACK: "Lanche da manhã",
  LUNCH: "Almoço",
  AFTERNOON_SNACK: "Lanche da tarde",
  DINNER: "Jantar",
  SUPPER: "Ceia",
  OTHER: "Outro",
}

export default function RecentMeals({ meals }: { meals: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Refeições de Hoje</CardTitle>
        <Link href="/dashboard/patient/meals" className="text-sm text-green-600 hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-gray-500 text-sm">Nenhuma refeição registrada hoje.</p>
            <Link href="/dashboard/patient/meals/new" className="text-green-600 text-sm font-medium hover:underline mt-2 inline-block">
              Registrar agora →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <Link key={meal.id} href="/dashboard/patient/meals" className="block">
                <div className="rounded-xl overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                  {meal.photoUrl ? (
                    <div className="relative w-full h-36">
                      <Image src={meal.photoUrl} alt="Refeição" fill className="object-cover" />
                      {/* Overlay badge */}
                      <div className="absolute top-2 left-2">
                        <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          {mealTypeLabels[meal.mealType]}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          {format(new Date(meal.loggedAt), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 bg-gray-200 flex items-center justify-center">
                      <span className="text-3xl">🍽️</span>
                    </div>
                  )}
                  <div className="px-3 py-2">
                    {!meal.photoUrl && (
                      <p className="text-xs font-medium text-gray-500 mb-0.5">
                        {mealTypeLabels[meal.mealType]} · {format(new Date(meal.loggedAt), "HH:mm")}
                      </p>
                    )}
                    {meal.caption && (
                      <p className="text-sm text-gray-700 truncate">{meal.caption}</p>
                    )}
                    {meal.emotion && (
                      <p className="text-xs text-gray-400 mt-0.5">{meal.emotion}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
