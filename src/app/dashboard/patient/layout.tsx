import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PatientSidebar from "@/components/patient/PatientSidebar"

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== "PATIENT") {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true },
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PatientSidebar user={user!} />
      <main className="flex-1 md:ml-64 p-4 md:p-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  )
}
