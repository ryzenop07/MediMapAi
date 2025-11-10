import Link from "next/link"
import { RoleCard } from "@/components/landing/role-card"
import { Hero } from "@/components/landing/hero"

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <Hero />
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-3xl md:text-4xl font-semibold text-balance mb-6">Choose your portal</h2>
        <p className="text-muted-foreground mb-8 max-w-prose">
          Continue as a user to search medicines and availability, or sign in as a pharmacist to update stock and manage
          your store.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleCard
            title="User"
            description="Find medicines nearby, check availability, and compare prices."
            imageSrc="/public/placeholder-user.jpg"
            // Using an existing repo image path without /public prefix
            // Correct path is below:
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleCard
            title="User"
            description="Find medicines nearby, check availability, and compare prices."
            imageSrc="/placeholder-user.jpg"
            actions={[
              { href: "/login?role=user", label: "Login", variant: "default" },
              { href: "/signup?role=user", label: "Sign up", variant: "secondary" },
            ]}
          />
          <RoleCard
            title="Pharmacist"
            description="Manage inventory, update medicine stock, and help customers faster."
            imageSrc="/placeholder.jpg"
            actions={[
              { href: "/login?role=pharmacist", label: "Login", variant: "default" },
              { href: "/signup?role=pharmacist", label: "Sign up", variant: "secondary" },
            ]}
          />
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="#" className="text-primary underline-offset-4 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          .
        </div>
      </section>
    </main>
  )
}
