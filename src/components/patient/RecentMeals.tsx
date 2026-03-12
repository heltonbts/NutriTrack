import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import MealPhotoGrid from "@/components/MealPhotoGrid"

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
  const mealsWithoutPhoto = meals.filter((m) => !m.photoUrl)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Refeições de Hoje</CardTitle>
        <Link href="/dashboard/patient/meals" className="text-sm text-green-600 hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {meals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-gray-500 text-sm">Nenhuma refeição registrada hoje.</p>
            <Link
              href="/dashboard/patient/meals/new"
              className="text-green-600 text-sm font-medium hover:underline mt-2 inline-block"
            >
              Registrar agora →
            </Link>
          </div>
        ) : (
          <>
            <MealPhotoGrid meals={meals} href="/dashboard/patient/meals" />

            {/* Refeições sem foto */}
            {mealsWithoutPhoto.length > 0 && (
              <div className="space-y-1 pt-1">
                {mealsWithoutPhoto.map((meal) => (
                  <Link key={meal.id} href="/dashboard/patient/meals" className="block">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-lg">🍽️</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {mealTypeLabels[meal.mealType]}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(meal.loggedAt), "HH:mm")}
                          {meal.caption ? ` · ${meal.caption}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
