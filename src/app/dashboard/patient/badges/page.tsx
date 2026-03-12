import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function BadgesPage() {
  const session = await auth()
  const userId = session!.user.id

  const [allBadges, earned] = await Promise.all([
    prisma.badge.findMany({ orderBy: { id: "asc" } }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
  ])

  const earnedMap = new Map<string, Date>(
    earned.map((ub: (typeof earned)[number]) => [ub.badgeId, ub.earnedAt])
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Conquistas</h1>
        <p className="text-gray-500">
          {earned.length} de {allBadges.length} conquistas desbloqueadas
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allBadges.map((badge: (typeof allBadges)[number]) => {
          const earnedAt = earnedMap.get(badge.id)
          const isEarned = !!earnedAt
          return (
            <Card
              key={badge.id}
              className={`text-center transition-all ${isEarned ? "ring-2 ring-yellow-300 shadow-md" : "opacity-40 grayscale"}`}
            >
              <CardContent className="p-4">
                <p className="text-4xl mb-2">{badge.icon}</p>
                <p className="font-semibold text-sm text-gray-900">{badge.name}</p>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                {isEarned ? (
                  <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    ✓ {format(new Date(earnedAt!), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                    Bloqueada
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
