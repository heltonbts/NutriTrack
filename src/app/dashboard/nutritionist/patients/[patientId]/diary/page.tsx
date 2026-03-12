import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import DiaryCommentForm from "@/components/nutritionist/DiaryCommentForm"

export default async function PatientDiaryPage({
  params,
}: {
  params: Promise<{ patientId: string }>
}) {
  const { patientId } = await params
  const session = await auth()
  const nutritionistId = session!.user.id

  const link = await prisma.patientNutritionist.findUnique({
    where: { patientId_nutritionistId: { patientId, nutritionistId } },
  })
  if (!link) notFound()

  const [patient, entries] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId } }),
    prisma.diaryEntry.findMany({
      where: { userId: patientId },
      orderBy: { date: "desc" },
      take: 20,
      include: { comments: true },
    }),
  ])

  if (!patient) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/nutritionist/patients/${patientId}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diário</h1>
          <p className="text-gray-500">{patient.name}</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">Nenhuma entrada no diário ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(entry.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                  {entry.mood && (
                    <span className="bg-pink-100 text-pink-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {entry.mood}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 text-sm whitespace-pre-line">{entry.content}</p>

                {entry.comments.length > 0 && (
                  <div className="space-y-2">
                    {entry.comments.map((comment) => (
                      <div key={comment.id} className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-teal-700 mb-1">Seu comentário</p>
                        <p className="text-sm text-teal-900">{comment.content}</p>
                        <p className="text-xs text-teal-500 mt-1">
                          {format(new Date(comment.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <DiaryCommentForm entryId={entry.id} hasComment={entry.comments.length > 0} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
