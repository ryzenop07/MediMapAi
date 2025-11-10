"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

export function LoginForm({ defaultRole = "user" }: { defaultRole?: "user" | "pharmacist" }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"user" | "pharmacist">(defaultRole)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const base = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Login failed")
      toast({ title: "Logged in", description: "Welcome back!" })
      // Redirect based on role
      router.push(role === "pharmacist" ? "/dashboard/pharmacist" : "/dashboard/user")
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your account as User or Pharmacist.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <RadioGroup value={role} onValueChange={(v) => setRole(v as any)} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="role-user" value="user" />
                <Label htmlFor="role-user">User</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="role-pharmacist" value="pharmacist" />
                <Label htmlFor="role-pharmacist">Pharmacist</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
