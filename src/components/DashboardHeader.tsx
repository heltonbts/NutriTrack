"use client";

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link href={settingsHref}>
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-brand-purple flex-shrink-0 hover:ring-brand-magenta transition-all">
              {image ? (
                <Image src={image} alt={name ?? ""} width={48} height={48} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-brand-teal flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </motion.div>
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  )
}
