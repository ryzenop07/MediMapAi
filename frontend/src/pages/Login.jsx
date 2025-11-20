"use client"

import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import { apiFetch } from "../lib/api"

export default function Login() {
  const [sp] = useSearchParams()
  const role = sp.get("role") || "user"
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await apiFetch(`/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Login failed")
      localStorage.setItem("token", data.token)
      console.log("[v0] Login OK")
      navigate("/")
    } catch (err) {
      console.log("[v0] Login error:", err?.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-lg p-6 border"
      >
        <h2 className="text-2xl font-semibold mb-2">Log in ({role})</h2>
        {error && (
          <p className="mb-3 text-sm" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}
        <label className="block text-sm mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="w-full mb-3 p-2 rounded border"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="block text-sm mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full mb-4 p-2 rounded border"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full py-2 rounded text-white"
          style={{ background: "var(--color-primary)" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <div className="mt-3 text-sm opacity-80">
          No account?{" "}
          <Link to={`/signup?role=${role}`} className="underline">
            Sign up
          </Link>
        </div>
      </motion.form>
    </main>
  )
}
