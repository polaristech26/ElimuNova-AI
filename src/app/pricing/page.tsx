import { PublicNav } from "@/components/ui/public-nav"
import { prisma } from "@/lib/prisma"
import { PricingPlans } from "@/components/pricing/pricing-plans"

export default async function PricingPage() {
  // Fetch active packages from DB (server component)
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl elimunova-animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-600/20 rounded-full blur-3xl elimunova-animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <PublicNav />

      {/* Pricing Plans Component */}
      <PricingPlans packages={packages} />
    </div>
  )
}