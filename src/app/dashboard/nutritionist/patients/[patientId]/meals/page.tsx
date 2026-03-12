import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MealCommentForm from "@/components/nutritionist/MealCommentForm";
import MealPhotoGrid from "@/components/MealPhotoGrid";

const mealTypeLabel: Record<string, string> = {
  BREAKFAST: "Café da manhã",
  MORNING_SNACK: "Lanche da manhã",
  LUNCH: "Almoço",
  AFTERNOON_SNACK: "Lanche da tarde",
  DINNER: "Jantar",
  SUPPER: "Ceia",
  OTHER: "Outro",
};

export default async function PatientMealsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const session = await auth();
  const nutritionistId = session!.user.id;

  const link = await prisma.patientNutritionist.findUnique({
    where: { patientId_nutritionistId: { patientId, nutritionistId } },
  });
  if (!link) notFound();

  const [patient, meals] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId } }),
    prisma.mealLog.findMany({
      where: { userId: patientId },
      orderBy: { loggedAt: "desc" },
      take: 30,
      include: { comments: true },
    }),
  ]);

  if (!patient) notFound();

  // 1. Extraímos os tipos da resposta do Prisma
  type MealType = (typeof meals)[number];
  type CommentType = MealType["comments"][number];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/nutritionist/patients/${patientId}`}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refeições</h1>
          <p className="text-gray-500">{patient.name}</p>
        </div>
      </div>

      {meals.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">Nenhuma refeição registrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Grade de fotos — visão geral estilo Instagram */}
          {meals.some((m) => m.photoUrl) && (
            <Card>
              <CardContent className="p-3">
                <MealPhotoGrid meals={meals} />
              </CardContent>
            </Card>
          )}

          {/* Detalhes de cada refeição */}
          {meals.map((meal: MealType) => (
            <Card key={meal.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {mealTypeLabel[meal.mealType] ?? meal.mealType}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(
                        new Date(meal.loggedAt),
                        "dd 'de' MMMM 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    {meal.hungerBefore !== null && (
                      <span>
                        Fome: <strong>{meal.hungerBefore}</strong>
                      </span>
                    )}
                    {meal.satietyAfter !== null && (
                      <span>
                        Saciedade: <strong>{meal.satietyAfter}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {meal.photoUrl && (
                  <img
                    src={meal.photoUrl}
                    alt="Foto da refeição"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                )}

                {meal.caption && (
                  <p className="text-gray-700 text-sm">{meal.caption}</p>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {meal.emotion && (
                    <span className="bg-gray-100 rounded px-2 py-0.5">
                      😊 {meal.emotion}
                    </span>
                  )}
                  {meal.location && (
                    <span className="bg-gray-100 rounded px-2 py-0.5">
                      📍 {meal.location}
                    </span>
                  )}
                  <span className="bg-gray-100 rounded px-2 py-0.5">
                    {meal.companions === "ALONE"
                      ? "👤 Sozinho(a)"
                      : "👥 Com outras pessoas"}
                  </span>
                </div>

                {/* Existing comments */}
                {meal.comments.length > 0 && (
                  <div className="space-y-2">
                    {/* 3. Tipamos o comment no map interno */}
                    {meal.comments.map((comment: CommentType) => (
                      <div
                        key={comment.id}
                        className="bg-teal-50 border border-teal-200 rounded-lg p-3"
                      >
                        <p className="text-xs font-medium text-teal-700 mb-1">
                          Seu comentário
                        </p>
                        <p className="text-sm text-teal-900">
                          {comment.content}
                        </p>
                        <p className="text-xs text-teal-500 mt-1">
                          {format(
                            new Date(comment.createdAt),
                            "dd/MM 'às' HH:mm",
                            { locale: ptBR },
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment form */}
                <MealCommentForm
                  mealId={meal.id}
                  hasComment={meal.comments.length > 0}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
