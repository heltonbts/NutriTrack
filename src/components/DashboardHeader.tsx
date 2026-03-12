import Image from "next/image"
import Link from "next/link"

interface DashboardHeaderProps {
  name: string | null
  image: string | null
  subtitle: string
  settingsHref: string
}

export default function DashboardHeader({ name, image, subtitle, settingsHref }: DashboardHeaderProps) {
  const firstName = name?.split(" ")[0]

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href={settingsHref}>
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-green-200 flex-shrink-0 hover:ring-green-400 transition-all">
            {image ? (
              <Image src={image} alt={name ?? ""} width={48} height={48} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-green-100 flex items-center justify-center">
                <span className="text-lg font-bold text-green-700">
                  {name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
