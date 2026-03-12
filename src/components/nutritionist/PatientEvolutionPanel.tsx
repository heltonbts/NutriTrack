"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInSaoPaulo } from "@/lib/timezone";

type QuizPoint = {
  date: string | Date;
  dailyNote: number;
};

type BadgePoint = {
  earnedAt: string | Date;
  badge: {
    name: string;
    icon: string;
  };
};

export default function PatientEvolutionPanel({
  quizzes,
  badges,
}: {
  quizzes: QuizPoint[];
  badges: BadgePoint[];
}) {
  const orderedQuizzes = [...quizzes].reverse();
  const orderedBadges = [...badges].reverse();

  const chartData = orderedQuizzes.map((quiz) => {
    const quizDate = new Date(quiz.date);
    const earnedBadges = orderedBadges.filter(
      (badge) => new Date(badge.earnedAt) <= quizDate,
    ).length;

    return {
      date: formatInSaoPaulo(quizDate, { day: "2-digit", month: "2-digit" }),
      note: Number(quiz.dailyNote.toFixed(1)),
      badges: earnedBadges,
    };
  });

  const latestQuiz = orderedQuizzes[orderedQuizzes.length - 1];
  const firstQuiz = orderedQuizzes[0];
  const trend =
    latestQuiz && firstQuiz
      ? latestQuiz.dailyNote - firstQuiz.dailyNote
      : 0;
  const latestBadge = badges[0];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Evolucao e conquistas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
            Sem quizzes ainda para montar a evolucao deste paciente.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="note"
                  domain={[0, 10]}
                  tick={{ fontSize: 11 }}
                  width={28}
                />
                <YAxis
                  yAxisId="badges"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  width={24}
                />
                <Tooltip />
                <Bar
                  yAxisId="badges"
                  dataKey="badges"
                  fill="#facc15"
                  radius={[4, 4, 0, 0]}
                  name="Conquistas"
                  barSize={20}
                />
                <Line
                  yAxisId="note"
                  type="monotone"
                  dataKey="note"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ fill: "#0f766e", r: 3 }}
                  name="Nota do quiz"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-teal-50 px-3 py-2">
            <div className="flex items-center gap-2 text-teal-700">
              <TrendingUp className="w-4 h-4" />
              <span>Evolucao</span>
            </div>
            <p className="mt-1 font-semibold text-teal-900">
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}
            </p>
          </div>
          <div className="rounded-lg bg-yellow-50 px-3 py-2">
            <div className="flex items-center gap-2 text-yellow-700">
              <Trophy className="w-4 h-4" />
              <span>Conquistas</span>
            </div>
            <p className="mt-1 font-semibold text-yellow-900">{badges.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-gray-500">Ultima nota</p>
            <p className="mt-1 font-semibold text-gray-900">
              {latestQuiz ? latestQuiz.dailyNote.toFixed(1) : "-"}
            </p>
          </div>
        </div>

        {latestBadge && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
            <span className="mr-2">{latestBadge.badge.icon}</span>
            Ultima conquista: {latestBadge.badge.name}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
