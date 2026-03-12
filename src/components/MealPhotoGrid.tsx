import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: "Café da manhã",
  MORNING_SNACK: "Lanche da manhã",
  LUNCH: "Almoço",
  AFTERNOON_SNACK: "Lanche da tarde",
  DINNER: "Jantar",
  SUPPER: "Ceia",
  OTHER: "Outro",
}

interface Meal {
  id: string
  photoUrl: string | null
  mealType: string
  loggedAt: Date | string
}

interface MealPhotoGridProps {
  meals: Meal[]
  href?: string
}

function PhotoCell({
  meal,
  href,
  className,
  overlay = true,
  extra,
}: {
  meal: Meal
  href?: string
  className?: string
  overlay?: boolean
  extra?: number
}) {
  const inner = (
    <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${className ?? ""}`}>
      <Image
        src={meal.photoUrl!}
        alt={mealTypeLabels[meal.mealType] ?? "Refeição"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      )}
      {overlay && (
        <div className="absolute bottom-1.5 left-1.5">
          <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full leading-none">
            {mealTypeLabels[meal.mealType]}
          </span>
        </div>
      )}
      {overlay && (
        <div className="absolute top-1.5 right-1.5">
          <span className="text-xs text-white bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full leading-none">
            {format(new Date(meal.loggedAt), "HH:mm")}
          </span>
        </div>
      )}
      {extra !== undefined && extra > 0 && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
          <span className="text-white text-xl font-bold">+{extra}</span>
        </div>
      )}
    </div>
  )

  if (href) return <Link href={href} className="contents">{inner}</Link>
  return inner
}

export default function MealPhotoGrid({ meals, href }: MealPhotoGridProps) {
  const photos = meals.filter((m) => m.photoUrl)
  if (photos.length === 0) return null

  const MAX_VISIBLE = 6
  const visible = photos.slice(0, MAX_VISIBLE)
  const extra = photos.length - MAX_VISIBLE

  const count = photos.length

  // 1 photo — ocupa espaço todo
  if (count === 1) {
    return (
      <div className="h-48">
        <PhotoCell meal={visible[0]} href={href} className="h-full w-full" />
      </div>
    )
  }

  // 2 fotos — 2 colunas iguais
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 h-48">
        {visible.map((meal) => (
          <PhotoCell key={meal.id} meal={meal} href={href} className="h-full" />
        ))}
      </div>
    )
  }

  // 3 fotos — estilo Instagram: 1 grande à esquerda + 2 menores empilhadas à direita
  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 h-48">
        <PhotoCell meal={visible[0]} href={href} className="h-full" />
        <div className="grid grid-rows-2 gap-1">
          <PhotoCell meal={visible[1]} href={href} className="h-full" />
          <PhotoCell meal={visible[2]} href={href} className="h-full" />
        </div>
      </div>
    )
  }

  // 4 fotos — grade 2x2
  if (count === 4) {
    return (
      <div className="grid grid-cols-2 gap-1 h-48">
        {visible.slice(0, 4).map((meal) => (
          <PhotoCell key={meal.id} meal={meal} href={href} className="h-full" />
        ))}
      </div>
    )
  }

  // 5–6 fotos — grade 2×3 ou 3×2, altura adaptada
  // 7+ fotos — mostra 6 com overlay +N na última
  const rows = Math.ceil(visible.length / 3)
  return (
    <div
      className="grid grid-cols-3 gap-1"
      style={{ height: `${rows * 96}px` }}
    >
      {visible.map((meal, i) => {
        const isLast = i === visible.length - 1
        return (
          <PhotoCell
            key={meal.id}
            meal={meal}
            href={href}
            className="h-full"
            extra={isLast && extra > 0 ? extra : undefined}
          />
        )
      })}
    </div>
  )
}
