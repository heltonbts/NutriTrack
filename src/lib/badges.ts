import { prisma } from "./prisma"
import { subDays, startOfDay } from "date-fns"

export async function checkAndAwardBadges(userId: string): Promise<{ id: string; name: string; icon: string }[]> {
  const [mealCount, diaryCount, quizCount, mealLogs, recentQuizzes, existingBadges, allBadges] =
    await Promise.all([
      prisma.mealLog.count({ where: { userId } }),
      prisma.diaryEntry.count({ where: { userId } }),
      prisma.dailyQuiz.count({ where: { userId } }),
      prisma.mealLog.findMany({
        where: { userId },
        orderBy: { loggedAt: "desc" },
        take: 14,
        select: { loggedAt: true },
      }),
      prisma.dailyQuiz.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 10,
        select: { hydration: true, sleepScore: true, dailyNote: true },
      }),
      prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
      prisma.badge.findMany(),
    ])

  const earnedIds = new Set(existingBadges.map((b) => b.badgeId))
  const badgeMap = Object.fromEntries(allBadges.map((b) => [b.id, b]))

  const candidates: string[] = []

  // Simple counts
  if (!earnedIds.has("badge_first_meal") && mealCount >= 1) candidates.push("badge_first_meal")
  if (!earnedIds.has("badge_first_diary") && diaryCount >= 1) candidates.push("badge_first_diary")
  if (!earnedIds.has("badge_diary_5") && diaryCount >= 5) candidates.push("badge_diary_5")
  if (!earnedIds.has("badge_first_quiz") && quizCount >= 1) candidates.push("badge_first_quiz")
  if (!earnedIds.has("badge_quiz_7") && quizCount >= 7) candidates.push("badge_quiz_7")

  // Meal streak — consecutive days with at least one meal
  const mealDaySet = new Set(
    mealLogs.map((m) => startOfDay(new Date(m.loggedAt)).toISOString())
  )
  if (!earnedIds.has("badge_streak_3") && hasConsecutiveDays(mealDaySet, 3)) {
    candidates.push("badge_streak_3")
  }
  if (!earnedIds.has("badge_streak_7") && hasConsecutiveDays(mealDaySet, 7)) {
    candidates.push("badge_streak_7")
  }

  // Hydration >= 8 for last 5 quizzes
  if (!earnedIds.has("badge_hydration_5")) {
    const last5 = recentQuizzes.slice(0, 5)
    if (last5.length >= 5 && last5.every((q) => q.hydration >= 8)) {
      candidates.push("badge_hydration_5")
    }
  }

  // Sleep >= 7 for last 5 quizzes
  if (!earnedIds.has("badge_sleep_5")) {
    const last5 = recentQuizzes.slice(0, 5)
    if (last5.length >= 5 && last5.every((q) => q.sleepScore >= 7)) {
      candidates.push("badge_sleep_5")
    }
  }

  // Improving daily note for last 5 quizzes (each day better than previous)
  if (!earnedIds.has("badge_improving_5")) {
    const last5 = recentQuizzes.slice(0, 5).reverse() // oldest → newest
    if (last5.length >= 5) {
      const improving = last5.every((q, i) => i === 0 || q.dailyNote > last5[i - 1].dailyNote)
      if (improving) candidates.push("badge_improving_5")
    }
  }

  // Award and return newly unlocked badges
  const newlyAwarded: { id: string; name: string; icon: string }[] = []
  for (const badgeId of candidates) {
    try {
      await prisma.userBadge.create({ data: { userId, badgeId } })
      const badge = badgeMap[badgeId]
      if (badge) newlyAwarded.push({ id: badge.id, name: badge.name, icon: badge.icon })
    } catch {
      // Already exists — ignore
    }
  }

  return newlyAwarded
}

function hasConsecutiveDays(daySet: Set<string>, required: number): boolean {
  let streak = 0
  for (let i = 0; i < required + 7; i++) {
    const day = startOfDay(subDays(new Date(), i)).toISOString()
    if (daySet.has(day)) {
      streak++
      if (streak >= required) return true
    } else {
      streak = 0
    }
  }
  return false
}
