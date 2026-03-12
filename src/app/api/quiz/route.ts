import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkAndAwardBadges } from "@/lib/badges"
import { getSaoPauloQuizDate } from "@/lib/timezone"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { dietScore, hungerControl, anxietyScore, planAdherence, hydration, sleepScore, snackUrge, generalScore } = body

  // anxietyScore and snackUrge are inverted: lower value = better outcome
  const normalizedScores = [
    dietScore,
    hungerControl,
    10 - anxietyScore,
    planAdherence,
    hydration,
    sleepScore,
    10 - snackUrge,
    generalScore,
  ]
  const dailyNote = normalizedScores.reduce((a: number, b: number) => a + b, 0) / normalizedScores.length

  const quizDate = getSaoPauloQuizDate()

  const quiz = await prisma.dailyQuiz.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: quizDate,
      }
    },
    update: {
      dietScore, hungerControl, anxietyScore, planAdherence,
      hydration, sleepScore, snackUrge, generalScore,
      dailyNote,
    },
    create: {
      userId: session.user.id,
      date: quizDate,
      dietScore, hungerControl, anxietyScore, planAdherence,
      hydration, sleepScore, snackUrge, generalScore,
      dailyNote,
    }
  })

  // Check for automatic feedback based on scores
  let autoFeedback = null
  if (anxietyScore >= 7) {
    autoFeedback = "Sua ansiedade ficou elevada hoje. Tente fazer uma pausa antes das refeições e registrar o que sentiu."
  } else if (snackUrge >= 7) {
    autoFeedback = "A vontade de beliscar esteve alta hoje. Verifique se está se hidratando bem e se as refeições estão te saciando."
  } else if (sleepScore <= 4) {
    autoFeedback = "Seu sono pode estar impactando sua fome e ansiedade. Tente dormir 30 minutos mais cedo hoje."
  } else if (planAdherence >= 8) {
    autoFeedback = "Você teve ótima adesão hoje! Excelente consistência. Continue assim! 🌟"
  }

  const newBadges = await checkAndAwardBadges(session.user.id)
  return NextResponse.json({ ...quiz, autoFeedback, newBadges })
}
