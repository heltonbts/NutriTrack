"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SettingsFormProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
    role: string
  }
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(user.image)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    uploadAvatar(file)
  }

  async function uploadAvatar(file: File) {
    setLoading(true)
    setSuccess(false)
    const formData = new FormData()
    formData.append("photo", file)

    const res = await fetch("/api/profile/avatar", { method: "POST", body: formData })

    if (res.ok) {
      const data = await res.json()
      setPreview(data.imageUrl)
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-200">
              {preview ? (
                <Image src={preview} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-4xl font-bold text-gray-400">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-md hover:bg-green-700 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="text-center">
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {user.role === "NUTRITIONIST" ? "Nutricionista" : "Paciente"}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Trocar foto"}
          </Button>

          {success && (
            <p className="text-sm text-green-600 font-medium">Foto atualizada com sucesso!</p>
          )}

          <p className="text-xs text-gray-400 text-center">
            JPG, PNG ou WEBP. A foto aparecerá no menu lateral.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Nome</p>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Email</p>
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Perfil</p>
            <p className="text-sm font-medium text-gray-900">
              {user.role === "NUTRITIONIST" ? "Nutricionista" : "Paciente"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
