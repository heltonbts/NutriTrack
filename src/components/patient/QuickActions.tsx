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
      color: "bg-brand-teal",
      bg: "bg-brand-teal/5",
    },
    {
      label: "Check-in de Treino",
      description: "Em breve",
      icon: Dumbbell,
      href: "/dashboard/patient/progress",
      color: "bg-brand-cyan",
      bg: "bg-brand-cyan/5",
    },
    {
      label: "Escrever no Diário",
      description: "Relatar o dia",
      icon: BookOpen,
      href: "/dashboard/patient/diary/new",
      color: "bg-brand-purple",
      bg: "bg-brand-purple/5",
    },
    {
      label: "Questionário Diário",
      description: hasQuizToday ? "Finalizado" : "Pendente",
      icon: hasQuizToday ? CheckCircle : ClipboardList,
      href: "/dashboard/patient/quiz",
      color: hasQuizToday ? "bg-brand-magenta-dark" : "bg-brand-magenta",
      bg: hasQuizToday ? "bg-brand-magenta/5" : "bg-brand-magenta/5",
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
            className={action.disabled ? "cursor-default pointer-events-none opacity-80" : ""}
          >
            <Card className={`p-4 hover:shadow-lg transition-all border-0 hover:-translate-y-1 ${action.bg}`}>
              <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{action.label}</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">{action.description}</p>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
