"use client"

import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { motion } from "framer-motion"

export default function LoginPage() {
  const params = useSearchParams()
  const role = (params.get("role") as "user" | "pharmacist") || "user"
  return (
    <main className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl md:text-4xl font-semibold">Login</h1>
        <p className="text-muted-foreground mt-2">Welcome back. Please enter your details to continue.</p>
      </motion.div>
      <div className="mt-8 max-w-lg">
        <LoginForm defaultRole={role} />
      </div>
    </main>
  )
}
