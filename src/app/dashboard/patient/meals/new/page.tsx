"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const emotions = [
  "Ansioso(a)", "Feliz", "Triste", "Estressado(a)", "Calmo(a)",
  "Entediado(a)", "Culpado(a)", "Satisfeito(a)", "Cansado(a)", "Irritado(a)"
]

export default function NewMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [mealType, setMealType] = useState("OTHER")
  const [hungerBefore, setHungerBefore] = useState("")
  const [satietyAfter, setSatietyAfter] = useState("")
  const [emotion, setEmotion] = useState("")
  const [location, setLocation] = useState("")
  const [companions, setCompanions] = useState("ALONE")

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      if (photo) formData.append("photo", photo)
      formData.append("caption", caption)
      formData.append("mealType", mealType)
      formData.append("companions", companions)
      if (hungerBefore) formData.append("hungerBefore", hungerBefore)
      if (satietyAfter) formData.append("satietyAfter", satietyAfter)
      if (emotion) formData.append("emotion", emotion)
      if (location) formData.append("location", location)

      const res = await fetch("/api/meals", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        router.push("/dashboard/patient/meals")
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/patient/meals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Registrar Refeição</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto da Refeição</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                capture="environment"
              />
              {photoPreview ? (
                <div className="relative w-full h-72 rounded-xl overflow-hidden">
                  <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity">
                    <p className="text-white font-semibold text-sm">Trocar foto</p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-green-400 active:border-green-400 transition-colors">
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">Adicionar foto da refeição</p>
                  <p className="text-xs text-gray-400 mt-1">Toque para tirar foto ou escolher da galeria</p>
                </div>
              )}
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes da Refeição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Refeição</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BREAKFAST">Café da manhã</SelectItem>
                  <SelectItem value="MORNING_SNACK">Lanche da manhã</SelectItem>
                  <SelectItem value="LUNCH">Almoço</SelectItem>
                  <SelectItem value="AFTERNOON_SNACK">Lanche da tarde</SelectItem>
                  <SelectItem value="DINNER">Jantar</SelectItem>
                  <SelectItem value="SUPPER">Ceia</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Legenda (opcional)</Label>
              <Textarea
                placeholder="O que você comeu? Como foi?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fome antes (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Ex: 7"
                  value={hungerBefore}
                  onChange={(e) => setHungerBefore(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Saciedade depois (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Ex: 8"
                  value={satietyAfter}
                  onChange={(e) => setSatietyAfter(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Como você estava se sentindo?</Label>
              <Select value={emotion} onValueChange={setEmotion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma emoção" />
                </SelectTrigger>
                <SelectContent>
                  {emotions.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Local (opcional)</Label>
              <Input
                placeholder="Ex: Trabalho, Casa, Restaurante..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Companhia</Label>
              <Select value={companions} onValueChange={setCompanions}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALONE">Sozinho(a)</SelectItem>
                  <SelectItem value="WITH_OTHERS">Acompanhado(a)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Refeição"
          )}
        </Button>
      </form>
    </div>
  )
}
