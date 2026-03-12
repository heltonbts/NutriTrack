"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { formatInSaoPaulo } from "@/lib/timezone"

export default function WeeklyProgress({ quizzes }: { quizzes: any[] }) {
  const data = [...quizzes]
    .reverse()
    .map((q) => ({
      date: formatInSaoPaulo(q.date, { day: "2-digit", month: "2-digit" }),
      nota: parseFloat(q.dailyNote.toFixed(1)),
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">📈</p>
            <p className="text-gray-500 text-sm">Responda o questionário para ver sua evolução.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="nota"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: "#16a34a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
