"use client"

import { Suspense, useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Logo from "@/components/Logo"
import { Loader2 } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setSuccess("Conta criada com sucesso! Faça login para continuar.")
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou senha incorretos")
        setLoading(false)
        return
      }

      // Inicia o redirecionamento - o loading.tsx do dashboard assumirá daqui
      router.push("/")
      router.refresh()
    } catch (err) {
      setError("Ocorreu um erro ao entrar. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <>
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-2 rounded text-xs text-center">
            {error}
          </div>
        )}
        <Button 
          type="submit" 
          className="w-full bg-brand-magenta hover:bg-brand-magenta-dark text-white h-11" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Acessando...</span>
            </div>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Nutricionista sem conta?{" "}
        <Link href="/register" className="text-brand-magenta font-medium hover:underline">
          Cadastre-se
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Logo iconOnly size={80} />
          </div>
          <CardDescription className="text-lg">Nutrição comportamental inteligente</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
