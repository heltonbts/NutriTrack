"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Bell, Trash2, Edit2, Plus, X, Calendar, Check } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Reminder {
  id: string
  content: string
  endDate: string
  createdAt: string
}

export default function ReminderManager({ patientId }: { patientId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [content, setContent] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchReminders()
  }, [patientId])

  async function fetchReminders() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/nutritionist/reminders?patientId=${patientId}`)
      const data = await res.json()
      setReminders(data)
    } catch (error) {
      console.error("Failed to fetch reminders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content || !endDate) return

    try {
      const method = editingId ? "PATCH" : "POST"
      const body = editingId 
        ? { id: editingId, content, endDate }
        : { patientId, content, endDate }

      const res = await fetch("/api/nutritionist/reminders", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setContent("")
        setEndDate("")
        setIsAdding(false)
        setEditingId(null)
        fetchReminders()
      }
    } catch (error) {
      console.error("Failed to save reminder:", error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja apagar este lembrete?")) return

    try {
      const res = await fetch(`/api/nutritionist/reminders?id=${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error("Failed to delete reminder:", error)
    }
  }

  function handleEdit(reminder: Reminder) {
    setEditingId(reminder.id)
    setContent(reminder.content)
    // Format YYYY-MM-DD for input date
    setEndDate(new Date(reminder.endDate).toISOString().split("T")[0])
    setIsAdding(true)
  }

  function handleCancel() {
    setIsAdding(false)
    setEditingId(null)
    setContent("")
    setEndDate("")
  }

  return (
    <Card className="border-orange-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          Lembretes para o Paciente
        </CardTitle>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)} 
            size="sm" 
            variant="outline"
            className="text-orange-600 border-orange-200 hover:bg-orange-50 gap-1"
          >
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-orange-50/50 rounded-xl p-4 mb-4 border border-orange-100 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Texto do Lembrete</Label>
              <Textarea
                id="content"
                placeholder="Ex: Não esqueça de beber 3L de água hoje!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-white border-orange-200 focus:ring-orange-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Encerramento (Até quando exibir?)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 bg-white border-orange-200 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={handleCancel} className="gap-1">
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white gap-1">
                <Check className="w-4 h-4" />
                {editingId ? "Salvar Alterações" : "Criar Lembrete"}
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="py-4 text-center text-gray-500 text-sm italic">Carregando lembretes...</div>
        ) : reminders.length === 0 ? (
          !isAdding && (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">Nenhum lembrete ativo para este paciente.</p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const isExpired = new Date(reminder.endDate) < new Date()
              return (
                <div 
                  key={reminder.id} 
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                    isExpired 
                      ? "bg-gray-50 border-gray-200 opacity-60" 
                      : "bg-white border-orange-100 hover:border-orange-300 shadow-sm"
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <p className={`text-sm ${isExpired ? "text-gray-500" : "text-gray-900 font-medium"}`}>
                      {reminder.content}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expira em: {format(new Date(reminder.endDate), "dd 'de' MMMM", { locale: ptBR })}
                      {isExpired && <span className="text-red-500 font-bold ml-1">(EXPIRADO)</span>}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(reminder)}
                      className="h-8 w-8 text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(reminder.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
