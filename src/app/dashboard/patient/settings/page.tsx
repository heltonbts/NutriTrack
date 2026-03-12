import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SettingsForm from "@/components/profile/SettingsForm"

export default async function PatientSettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, image: true, role: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie seu perfil</p>
      </div>
      <SettingsForm user={user!} />
    </div>
  )
}
