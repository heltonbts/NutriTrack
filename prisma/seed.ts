import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { subDays, startOfDay } from "date-fns";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

console.log("DATABASE_URL:", process.env.DATABASE_URL);

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Badges ───────────────────────────────────────────────────────────────
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { id: "badge_first_meal" },
      update: {},
      create: {
        id: "badge_first_meal",
        name: "Primeiro Passo",
        description: "Registrou a primeira refeição",
        icon: "🌱",
        condition: '{"type":"meal_count","value":1}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_streak_3" },
      update: {},
      create: {
        id: "badge_streak_3",
        name: "3 Dias Seguidos",
        description: "Registrou refeições por 3 dias consecutivos",
        icon: "🔥",
        condition: '{"type":"meal_streak","value":3}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_streak_7" },
      update: {},
      create: {
        id: "badge_streak_7",
        name: "Semana Completa",
        description: "7 dias com registros de refeições",
        icon: "🏆",
        condition: '{"type":"meal_streak","value":7}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_first_diary" },
      update: {},
      create: {
        id: "badge_first_diary",
        name: "Diário Aberto",
        description: "Primeiro relato no diário",
        icon: "📔",
        condition: '{"type":"diary_count","value":1}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_diary_5" },
      update: {},
      create: {
        id: "badge_diary_5",
        name: "Autoconhecimento",
        description: "5 relatos no diário",
        icon: "🧘",
        condition: '{"type":"diary_count","value":5}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_first_quiz" },
      update: {},
      create: {
        id: "badge_first_quiz",
        name: "Questionado",
        description: "Respondeu o primeiro questionário",
        icon: "✅",
        condition: '{"type":"quiz_count","value":1}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_quiz_7" },
      update: {},
      create: {
        id: "badge_quiz_7",
        name: "Constante",
        description: "7 questionários respondidos",
        icon: "📊",
        condition: '{"type":"quiz_count","value":7}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_hydration_5" },
      update: {},
      create: {
        id: "badge_hydration_5",
        name: "Hidratado(a)",
        description: "Nota de hidratação acima de 8 por 5 dias",
        icon: "💧",
        condition: '{"type":"hydration_streak","value":5}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_sleep_5" },
      update: {},
      create: {
        id: "badge_sleep_5",
        name: "Boa Noite",
        description: "Nota de sono acima de 7 por 5 dias",
        icon: "🌙",
        condition: '{"type":"sleep_streak","value":5}',
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge_improving_5" },
      update: {},
      create: {
        id: "badge_improving_5",
        name: "Em Evolução",
        description: "Nota geral crescente por 5 dias",
        icon: "📈",
        condition: '{"type":"note_improving","value":5}',
      },
    }),
  ]);
  console.log(`✅ ${badges.length} badges cadastradas`);

  // ─── Nutricionista ────────────────────────────────────────────────────────
  const nutriPassword = await bcrypt.hash("nutri123", 12);
  const nutritionist = await prisma.user.upsert({
    where: { email: "nutri@nutritrack.com" },
    update: {},
    create: {
      name: "Dra. Ana Silva",
      email: "nutri@nutritrack.com",
      password: nutriPassword,
      role: "NUTRITIONIST",
    },
  });
  console.log(`✅ Nutricionista: ${nutritionist.email}`);

  // ─── Paciente 1 (com dados de demonstração) ───────────────────────────────
  const p1Password = await bcrypt.hash("paciente123", 12);
  const patient1 = await prisma.user.upsert({
    where: { email: "maria@email.com" },
    update: {},
    create: {
      name: "Maria Oliveira",
      email: "maria@email.com",
      password: p1Password,
      role: "PATIENT",
    },
  });
  console.log(`✅ Paciente 1: ${patient1.email}`);

  // ─── Paciente 2 (conta limpa para testar do zero) ─────────────────────────
  const p2Password = await bcrypt.hash("paciente123", 12);
  const patient2 = await prisma.user.upsert({
    where: { email: "joao@email.com" },
    update: {},
    create: {
      name: "João Santos",
      email: "joao@email.com",
      password: p2Password,
      role: "PATIENT",
    },
  });
  console.log(`✅ Paciente 2: ${patient2.email}`);

  // ─── Vincular pacientes à nutricionista ───────────────────────────────────
  await prisma.patientNutritionist.upsert({
    where: {
      patientId_nutritionistId: {
        patientId: patient1.id,
        nutritionistId: nutritionist.id,
      },
    },
    update: {},
    create: { patientId: patient1.id, nutritionistId: nutritionist.id },
  });
  await prisma.patientNutritionist.upsert({
    where: {
      patientId_nutritionistId: {
        patientId: patient2.id,
        nutritionistId: nutritionist.id,
      },
    },
    update: {},
    create: { patientId: patient2.id, nutritionistId: nutritionist.id },
  });
  console.log("✅ Pacientes vinculados à nutricionista");

  // ─── Dados de demonstração para Maria (últimos 7 dias) ───────────────────
  const mealTypes = [
    "BREAKFAST",
    "LUNCH",
    "AFTERNOON_SNACK",
    "DINNER",
  ] as const;
  const emotions = [
    "Calmo(a)",
    "Ansioso(a)",
    "Feliz",
    "Cansado(a)",
    "Satisfeito(a)",
  ];
  const captions = [
    "Café com tapioca e ovo mexido",
    "Almoço no trabalho, salada + frango grelhado",
    "Fruta da tarde, maçã com canela",
    "Jantei em casa, sopa de legumes",
    "Iogurte com granola pela manhã",
    "Almoço em família, arroz, feijão e carne",
    "Lanche da tarde, barra de cereal",
  ];

  const quizData = [
    {
      diet: 8,
      hunger: 7,
      anxiety: 5,
      plan: 8,
      hydration: 9,
      sleep: 7,
      snack: 6,
      general: 8,
    },
    {
      diet: 7,
      hunger: 6,
      anxiety: 4,
      plan: 7,
      hydration: 8,
      sleep: 6,
      snack: 5,
      general: 7,
    },
    {
      diet: 6,
      hunger: 5,
      anxiety: 3,
      plan: 6,
      hydration: 7,
      sleep: 5,
      snack: 4,
      general: 6,
    },
    {
      diet: 7,
      hunger: 7,
      anxiety: 6,
      plan: 7,
      hydration: 9,
      sleep: 7,
      snack: 6,
      general: 7,
    },
    {
      diet: 8,
      hunger: 8,
      anxiety: 7,
      plan: 9,
      hydration: 9,
      sleep: 8,
      snack: 7,
      general: 8,
    },
    {
      diet: 9,
      hunger: 8,
      anxiety: 8,
      plan: 9,
      hydration: 10,
      sleep: 8,
      snack: 8,
      general: 9,
    },
    {
      diet: 8,
      hunger: 7,
      anxiety: 7,
      plan: 8,
      hydration: 9,
      sleep: 9,
      snack: 7,
      general: 8,
    },
  ];

  const diaryContents = [
    "Hoje foi um dia corrido no trabalho. Comi um pouco apressada no almoço, mas consegui manter a dieta. Fiquei um pouco ansiosa à tarde e tive vontade de beliscar, mas bebi água e passou.",
    "Ótimo dia! Consegui seguir o planejado direitinho. Fiz caminhada pela manhã e isso ajudou muito a controlar a ansiedade. Me senti muito bem.",
    "Dia difícil. Tive uma discussão no trabalho e acabei comendo mais do que devia no lanche. Sinto que isso afeta muito minha alimentação quando estou estressada.",
    "Dormi mal ontem e senti muito mais fome hoje. Tive dificuldade em resistir ao chocolate no final do dia, mas consegui comer só um quadradinho.",
    "Fim de semana em família! Comi um pouco mais no almoço, mas foi um momento especial. Compensei bebendo bastante água e fazendo uma caminhada à tarde.",
    "Semana sendo muito produtiva. Meu sono melhorou muito desde que comecei a desligar o celular mais cedo. Isso ajudou demais no controle da fome.",
    "Consegui evitar o belisco noturno! Tomei chá de camomila e funcionou. Cada dia é uma vitória pequena.",
  ];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);

    // Refeições
    const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
    const caption = captions[6 - i];
    await prisma.mealLog.create({
      data: {
        userId: patient1.id,
        caption,
        mealType,
        loggedAt: date,
        hungerBefore: Math.floor(Math.random() * 4) + 5,
        satietyAfter: Math.floor(Math.random() * 3) + 7,
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        location: i % 2 === 0 ? "Casa" : "Trabalho",
        companions: i % 3 === 0 ? "WITH_OTHERS" : "ALONE",
      },
    });

    // Questionário diário
    const q = quizData[6 - i];
    const scores = [
      q.diet,
      q.hunger,
      q.anxiety,
      q.plan,
      q.hydration,
      q.sleep,
      q.snack,
      q.general,
    ];
    const dailyNote = scores.reduce((a, b) => a + b, 0) / scores.length;

    const quiz = await prisma.dailyQuiz.upsert({
      where: { userId_date: { userId: patient1.id, date: dayStart } },
      update: {},
      create: {
        userId: patient1.id,
        date: dayStart,
        dietScore: q.diet,
        hungerControl: q.hunger,
        anxietyScore: q.anxiety,
        planAdherence: q.plan,
        hydration: q.hydration,
        sleepScore: q.sleep,
        snackUrge: q.snack,
        generalScore: q.general,
        dailyNote,
        nutritionistFeedback:
          i === 0
            ? "Excelente evolução esta semana, Maria! Seu controle da ansiedade melhorou muito. Vamos manter o foco na hidratação. 💪"
            : null,
        feedbackAt: i === 0 ? new Date() : null,
      },
    });

    // Diário
    await prisma.diaryEntry.create({
      data: {
        userId: patient1.id,
        content: diaryContents[6 - i],
        mood: emotions[Math.floor(Math.random() * emotions.length)],
        date,
      },
    });
  }
  console.log("✅ 7 dias de dados de demonstração criados para Maria");

  // ─── Badges para Maria ────────────────────────────────────────────────────
  const mariaBadges = [
    "badge_first_meal",
    "badge_streak_7",
    "badge_first_diary",
    "badge_diary_5",
    "badge_first_quiz",
    "badge_quiz_7",
  ];
  for (const badgeId of mariaBadges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: patient1.id, badgeId } },
      update: {},
      create: { userId: patient1.id, badgeId },
    });
  }
  console.log("✅ 6 badges desbloqueadas para Maria");

  console.log("\n🎉 Seed concluído!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Usuários criados:");
  console.log("");
  console.log("👩‍⚕️ NUTRICIONISTA");
  console.log("   Email:  nutri@nutritrack.com");
  console.log("   Senha:  nutri123");
  console.log("");
  console.log("🙋 PACIENTE 1 (com dados demo)");
  console.log("   Email:  maria@email.com");
  console.log("   Senha:  paciente123");
  console.log("");
  console.log("🙋 PACIENTE 2 (conta limpa)");
  console.log("   Email:  joao@email.com");
  console.log("   Senha:  paciente123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
