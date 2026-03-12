import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Lock } from "lucide-react"

export default async function DiaryPage() {
  const session = await auth()
  const userId = session!.user.id

  const entries = await prisma.diaryEntry.findMany({
    where: { userId },
    include: { comments: true },
    orderBy: { date: "desc" },
    take: 20,
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Diário</h1>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Apenas você e sua nutricionista podem ver
          </p>
        </div>
        <Link href="/dashboard/patient/diary/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Novo Relato</span>
          </Button>
        </Link>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-5xl mb-4">📔</p>
            <p className="text-gray-500">Seu diário está vazio.</p>
            <p className="text-gray-400 text-sm mt-1">Escreva sobre como foi seu dia, suas emoções e dificuldades.</p>
            <Link href="/dashboard/patient/diary/new">
              <Button className="mt-4 bg-green-600 hover:bg-green-700">
                Começar a escrever
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry: any) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">
                    {format(new Date(entry.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                  {entry.mood && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                      {entry.mood}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                  {entry.content}
                </p>
                {entry.comments.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs font-medium text-green-700 mb-1">Resposta da Nutricionista:</p>
                    <p className="text-sm text-gray-700">{entry.comments[entry.comments.length - 1].content}</p>
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
