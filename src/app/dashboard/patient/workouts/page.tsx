import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatInSaoPaulo } from "@/lib/timezone";
import { workoutTypeLabels } from "@/lib/workouts";

export default async function WorkoutsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const workouts = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { performedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treino Check</h1>
          <p className="text-gray-500 text-sm">
            Registre fotos, check-ins e como voce se sentiu apos treinar.
          </p>
        </div>
        <Link href="/dashboard/patient/workouts/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Novo check-in</span>
          </Button>
        </Link>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-5xl mb-4">🏋️</p>
            <p className="text-gray-500">Nenhum treino registrado ainda.</p>
            <p className="text-gray-400 text-sm mt-1">
              Salve sua atividade fisica, uma foto e um relato rapido do treino.
            </p>
            <Link href="/dashboard/patient/workouts/new">
              <Button className="mt-4 bg-green-600 hover:bg-green-700">
                Fazer primeiro check-in
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout: (typeof workouts)[number]) => (
            <Card key={workout.id} className="overflow-hidden">
              {workout.photoUrl ? (
                <div className="relative w-full h-56 sm:h-72">
                  <Image src={workout.photoUrl} alt="Treino" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <span className="text-5xl">🏃</span>
                </div>
              )}

              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    {workoutTypeLabels[workout.activityType]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatInSaoPaulo(workout.performedAt, {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    {workout.checkedIn ? "Check-in confirmado" : "Nao confirmado"}
                  </span>
                  {workout.feeling && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                      {workout.feeling}
                    </span>
                  )}
                </div>

                {workout.notes ? (
                  <p className="text-sm text-gray-700 leading-relaxed">{workout.notes}</p>
                ) : (
                  <p className="text-sm text-gray-400">Sem relato adicional.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
