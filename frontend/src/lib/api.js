const isDev = import.meta.env.DEV
const BASE = isDev
  ? "http://localhost:8000"
  : (import.meta.env.VITE_API_BASE_URL || "https://your-backend-url.onrender.com").replace(/\/$/, "")

export async function apiFetch(path, options = {}) {
  const url = `${BASE}${path}`
  console.log("[MediMapAi] apiFetch ->", url)

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null
  if (token) headers["Authorization"] = `Bearer ${token}`

  let body = options.body
  if (typeof body === "string" && path.startsWith("/api/auth/")) {
    try {
      const obj = JSON.parse(body)
      // Backend expects 'user' or 'pharmacist'; frontend may send 'patient'
      if (obj.role === "patient") obj.role = "user"
      body = JSON.stringify(obj)
    } catch {
      // ignore parse errors
    }
  }

  const res = await fetch(url, { ...options, headers, body })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text }
  }
  if (!res.ok) {
    const msg = data?.message || res.statusText || "Request failed"
    throw new Error(msg)
  }
  return data
}
