const isDev = import.meta.env.DEV
const BASE = isDev ? "" : (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")

export async function apiFetch(path, options = {}) {
  const url = `${BASE}${path}`
  console.log("[v0] apiFetch ->", url) // remove after verifying connectivity

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
      if (obj.role === "patient") obj.role = "user" // backend expects 'user' or 'pharmacist'
      body = JSON.stringify(obj)
    } catch {
      // ignore
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
