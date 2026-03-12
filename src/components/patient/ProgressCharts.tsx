"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts"
import { format } from "date-fns"

export default function ProgressCharts({ quizzes }: { quizzes: any[] }) {
  const lineData = quizzes.map((q) => ({
    date: format(new Date(q.date), "dd/MM"),
    nota: parseFloat(q.dailyNote.toFixed(1)),
    alimentação: q.dietScore,
    sono: q.sleepScore,
    ansiedade: q.anxietyScore,
  }))

  const lastQuiz = quizzes[quizzes.length - 1]
  const radarData = lastQuiz ? [
    { subject: "Alimentação", value: lastQuiz.dietScore },
    { subject: "Fome", value: lastQuiz.hungerControl },
    { subject: "Ansiedade", value: lastQuiz.anxietyScore },
    { subject: "Adesão", value: lastQuiz.planAdherence },
    { subject: "Hidratação", value: lastQuiz.hydration },
    { subject: "Sono", value: lastQuiz.sleepScore },
  ] : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nota Diária</CardTitle>
        </CardHeader>
        <CardContent>
          {lineData.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="nota" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a", r: 3 }} name="Nota Geral" />
                <Line type="monotone" dataKey="alimentação" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Alimentação" />
                <Line type="monotone" dataKey="sono" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Sono" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil do Último Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {radarData.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Hoje" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
