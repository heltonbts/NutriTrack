"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Bell, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Reminder {
  id: string
  content: string
  endDate: string
}

export default function ReminderAlert() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [closedIds, setClosedIds] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/patient/reminders")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReminders(data)
        }
      })
      .catch(err => console.error("Error fetching reminders:", err))
  }, [])

  const visibleReminders = reminders.filter(r => !closedIds.includes(r.id))

  if (visibleReminders.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      <AnimatePresence>
        {visibleReminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-none shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                <button 
                  onClick={() => setClosedIds([...closedIds, reminder.id])}
                  className="text-orange-200 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="pr-8">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    Lembrete da Nutri
                  </h3>
                  <p className="text-white text-lg font-medium leading-tight">
                    {reminder.content}
                  </p>
                </div>
              </CardContent>
              {/* Animated decorative element */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
