"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { apiFetch } from "../lib/api"

export default function Auth() {
  const [mode, setMode] = useState("login") // 'login' | 'signup'
  const [role, setRole] = useState("patient") // 'patient' | 'pharmacist'
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
      const body = mode === "login" ? { email, password, role } : { name, email, password, role }
      const data = await apiFetch(path, { method: "POST", body: JSON.stringify(body) })
      if (mode === "login") {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", role)
        navigate(role === "pharmacist" ? "/pharmacist" : "/patient")
      } else {
        setMode("login")
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-0 relative">
      <div className="auth-bg" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
      >
        <img src="/images/medicine-bottle.jpg" alt="MediFind" className="h-8 w-8 rounded float-soft" />
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-primary)" }}>
          MediFind
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-3xl card p-6"
      >
        {/* role switch */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 ${role === "patient" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setRole("patient")}
            >
              Patient
            </button>
            <button
              className={`px-3 py-1 ${role === "pharmacist" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setRole("pharmacist")}
            >
              Pharmacist
            </button>
          </div>
          <img src="/images/logo-mark.jpg" alt="Medical" className="h-8 w-8 rounded-full float-soft" />
        </div>

        {/* login / signup switch with animated underline */}
        <div className="relative flex items-center gap-2 mb-4 text-sm">
          <button
            className={`px-3 py-1 ${mode === "login" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={`px-3 py-1 ${mode === "signup" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
          <motion.div
            layoutId="switch-underline"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="absolute bottom-[-2px] h-[2px] rounded bg-[color:var(--color-primary)]"
            style={{ left: mode === "login" ? 0 : 90, width: 72 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode + role}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onSubmit={onSubmit}
          >
            {mode === "signup" && (
              <>
                <label className="block text-sm mb-1">Name</label>
                <input
                  className="w-full mb-3 p-2 rounded border"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </>
            )}
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full mb-3 p-2 rounded border"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full mb-4 p-2 rounded border"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p className="mb-3 text-sm" style={{ color: "var(--color-danger)" }}>
                {error}
              </p>
            )}
            <button disabled={loading} className="w-full py-2 rounded btn-primary">
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
