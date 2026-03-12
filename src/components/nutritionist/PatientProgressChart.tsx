"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInSaoPaulo } from "@/lib/timezone";

type QuizPoint = {
  date: string | Date;
  dietScore: number;
  sleepScore: number;
};

type WorkoutPoint = {
  performedAt: string | Date;
};

export default function PatientProgressChart({
  quizzes,
  workouts,
}: {
  quizzes: QuizPoint[];
  workouts: WorkoutPoint[];
}) {
  const orderedQuizzes = [...quizzes].reverse();

  // monta mapa de data -> quantidade de treinos naquele dia
  const workoutsByDate: Record<string, number> = {};
  for (const w of workouts) {
    const key = formatInSaoPaulo(new Date(w.performedAt), {
      day: "2-digit",
      month: "2-digit",
    });
    workoutsByDate[key] = (workoutsByDate[key] ?? 0) + 1;
  }

  const chartData = orderedQuizzes.map((quiz) => {
    const label = formatInSaoPaulo(new Date(quiz.date), {
      day: "2-digit",
      month: "2-digit",
    });
    return {
      date: label,
      alimentacao: quiz.dietScore,
      sono: quiz.sleepScore,
      treino: workoutsByDate[label] ?? 0,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Evolução do Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
            Sem dados ainda para montar a evolução deste paciente.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="score"
                domain={[0, 10]}
                tick={{ fontSize: 11 }}
                width={28}
              />
              <YAxis
                yAxisId="treino"
                orientation="right"
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                width={24}
              />
              <Tooltip />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(value) =>
                  value === "alimentacao"
                    ? "Alimentação"
                    : value === "sono"
                      ? "Sono"
                      : "Treinos"
                }
              />
              <Bar
                yAxisId="treino"
                dataKey="treino"
                fill="#a7f3d0"
                radius={[4, 4, 0, 0]}
                barSize={14}
                name="treino"
              />
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="alimentacao"
                stroke="#e11d8f"
                strokeWidth={2.5}
                dot={{ fill: "#e11d8f", r: 3 }}
                name="alimentacao"
              />
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="sono"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: "#3b82f6", r: 3 }}
                name="sono"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
