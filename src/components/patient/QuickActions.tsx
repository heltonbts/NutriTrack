import Link from "next/link"
import { Camera, BookOpen, ClipboardList, CheckCircle, Dumbbell } from "lucide-react"
import { Card } from "@/components/ui/card"

interface QuickActionsProps {
  hasQuizToday: boolean
  mealCount: number
  workoutCount: number
}

export default function QuickActions({ hasQuizToday, mealCount, workoutCount }: QuickActionsProps) {
  const actions = [
    {
      label: "Registrar Refeição",
      description: `${mealCount} hoje`,
      icon: Camera,
      href: "/dashboard/patient/meals/new",
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Check-in de Treino",
      description: workoutCount > 0 ? `${workoutCount} hoje` : "Registrar treino",
      icon: Dumbbell,
      href: "/dashboard/patient/workouts/new",
      color: "bg-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Escrever no Diário",
      description: "Relatar o dia",
      icon: BookOpen,
      href: "/dashboard/patient/diary/new",
      color: "bg-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Questionário Diário",
      description: hasQuizToday ? "Já respondido ✓" : "Pendente",
      icon: hasQuizToday ? CheckCircle : ClipboardList,
      href: "/dashboard/patient/quiz",
      color: hasQuizToday ? "bg-green-500" : "bg-orange-500",
      bg: hasQuizToday ? "bg-green-50" : "bg-orange-50",
      disabled: hasQuizToday,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.label}
            href={action.disabled ? "#" : action.href}
            className={action.disabled ? "cursor-default" : ""}
          >
            <Card className={`p-3 md:p-4 hover:shadow-md transition-shadow ${action.bg} border-0`}>
              <div className={`w-9 h-9 md:w-10 md:h-10 ${action.color} rounded-xl flex items-center justify-center mb-2 md:mb-3`}>
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <p className="font-semibold text-gray-900 text-xs md:text-sm leading-tight">{action.label}</p>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">{action.description}</p>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
