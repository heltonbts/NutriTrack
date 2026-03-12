import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import WorkoutFeedbackForm from "@/components/nutritionist/WorkoutFeedbackForm";
import { formatInSaoPaulo } from "@/lib/timezone";
import { workoutTypeLabels } from "@/lib/workouts";

export default async function PatientWorkoutsPage({
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

  const [patient, workouts] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId } }),
    prisma.workoutLog.findMany({
      where: { userId: patientId },
      orderBy: { performedAt: "desc" },
      take: 30,
    }),
  ]);

  if (!patient) notFound();

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
          <h1 className="text-2xl font-bold text-gray-900">Treinos</h1>
          <p className="text-gray-500">{patient.name}</p>
        </div>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">Nenhum treino registrado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout: (typeof workouts)[number]) => (
            <Card key={workout.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {workoutTypeLabels[workout.activityType]}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatInSaoPaulo(workout.performedAt, {
                        day: "2-digit",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {workout.checkedIn ? "Check-in confirmado" : "Sem check-in"}
                  </span>
                </div>

                {workout.photoUrl && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image src={workout.photoUrl} alt="Treino" fill className="object-cover" />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {workout.feeling && (
                    <span className="bg-gray-100 rounded px-2 py-0.5">
                      {workout.feeling}
                    </span>
                  )}
                </div>

                {workout.notes && (
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {workout.notes}
                  </p>
                )}

                {workout.nutritionistFeedback && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-teal-700 mb-1">
                      Seu feedback
                    </p>
                    <p className="text-sm text-teal-900">
                      {workout.nutritionistFeedback}
                    </p>
                    {workout.feedbackAt && (
                      <p className="text-xs text-teal-500 mt-1">
                        {formatInSaoPaulo(workout.feedbackAt, {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                )}

                <WorkoutFeedbackForm
                  workoutId={workout.id}
                  hasFeedback={!!workout.nutritionistFeedback}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
