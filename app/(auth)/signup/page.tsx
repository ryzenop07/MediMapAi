"use client"

import { useSearchParams } from "next/navigation"
import { SignupForm } from "@/components/auth/signup-form"
import { motion } from "framer-motion"

export default function SignupPage() {
  const params = useSearchParams()
  const role = (params.get("role") as "user" | "pharmacist") || "user"
  return (
    <main className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl md:text-4xl font-semibold">Create an account</h1>
        <p className="text-muted-foreground mt-2">Get started by creating your account.</p>
      </motion.div>
      <div className="mt-8 max-w-lg">
        <SignupForm defaultRole={role} />
      </div>
    </main>
  )
}
