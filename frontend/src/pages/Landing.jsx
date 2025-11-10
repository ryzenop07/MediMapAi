"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import Map from "../shared/Map"
import RoleCard from "./RoleCard"

export default function Landing() {
  const [query, setQuery] = useState("")
  const [coords, setCoords] = useState(null) // {lat,lng}
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function useMyLocation() {
    setError("")
    if (!navigator.geolocation) {
      setError("Geolocation not supported")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Unable to get location"),
      { enableHighAccuracy: true },
    )
  }

  async function onSearch(e) {
    e?.preventDefault?.()
    if (!query || !coords) {
      setError("Enter a medicine and set your location")
      return
    }
    setLoading(true)
    setError("")
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
      const url = `${base}/api/search?query=${encodeURIComponent(query)}&lat=${coords.lat}&lng=${coords.lng}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Search failed")
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const markers = useMemo(
    () =>
      results.map((r) => ({
        id: r._id || r.name + r.address,
        position: { lat: r.location?.coordinates?.[1], lng: r.location?.coordinates?.[0] },
        title: r.name,
        description: r.address,
      })),
    [results],
  )

  return (
    <main className="min-h-dvh flex flex-col">
      <Header />
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-8 px-6 md:px-10 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl font-bold mb-4 text-balance">Find medicines near you</h2>
          <p className="text-base opacity-80 mb-6">
            Search by name and check availability at local pharmacies. Role-based access for users and pharmacists.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="px-5 py-3 rounded text-white" style={{ background: "var(--color-primary)" }}>
              Get Started
            </Link>
            <a
              href="#roles"
              className="px-5 py-3 rounded border"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              See Roles
            </a>
          </div>
        </motion.div>
        <motion.img
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          src="/images/hero.jpg"
          alt="Medicine search hero"
          className="w-full rounded-lg shadow"
        />
      </section>

      {/* Search */}
      <section className="px-6 md:px-10 py-8">
        <form onSubmit={onSearch} className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <input
            aria-label="Search medicine"
            placeholder="Search a medicine, e.g., Paracetamol"
            className="p-3 rounded border"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={useMyLocation}
            className="px-4 rounded border"
            style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
          >
            Use my location
          </button>
          <button className="px-4 rounded text-white" style={{ background: "var(--color-primary)" }}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-sm" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}
      </section>

      {/* Results + Map */}
      <section className="px-6 md:px-10 pb-10 grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {results.length === 0 && <p className="opacity-70 text-sm">No results yet. Try a search.</p>}
          {results.map((r) => (
            <div
              key={r._id || r.name + r.address}
              className="rounded-lg p-4 border"
              style={{ borderColor: "rgba(2,6,23,0.1)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{r.name}</h3>
                  <p className="text-sm opacity-80">{r.address}</p>
                  {typeof r.distance === "number" && (
                    <p className="text-sm mt-1">Distance: {(r.distance / 1000).toFixed(2)} km</p>
                  )}
                </div>
                <img src="/images/medicine-bottle.jpg" alt="Pharmacy" className="h-14 w-14 rounded object-cover" />
              </div>
              <div className="mt-3">
                {r.items?.slice(0, 3).map((it, idx) => (
                  <span
                    key={idx}
                    className="inline-block text-xs mr-2 mb-2 px-2 py-1 rounded"
                    style={{ background: "rgba(22,163,74,0.12)", color: "var(--color-accent)" }}
                  >
                    {it.medicine} • {it.quantity} left{typeof it.price === "number" ? ` • $${it.price}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="min-h-[380px] rounded overflow-hidden border" style={{ borderColor: "rgba(2,6,23,0.1)" }}>
          <Map center={coords || { lat: 28.6139, lng: 77.209 }} markers={markers} />
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="px-6 md:px-10 py-10 grid md:grid-cols-2 gap-6">
        <RoleCard
          title="User"
          desc="Search, compare, and save your medicines."
          login="/login?role=user"
          signup="/signup?role=user"
          img="/images/medicine-bottle.jpg"
        />
        <RoleCard
          title="Pharmacist"
          desc="Manage inventory and update availability."
          login="/login?role=pharmacist"
          signup="/signup?role=pharmacist"
          img="/images/map-placeholder.jpg"
        />
      </section>

      <footer className="mt-auto p-6 text-sm opacity-70">© MediFind</footer>
    </main>
  )
}

function Header() {
  return (
    <header className="p-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/images/medicine-bottle.jpg" alt="MediFind logo" className="h-10 w-10 rounded" />
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-primary)" }}>
          MediFind
        </h1>
      </div>
      <nav className="flex items-center gap-3">
        <Link
          to="/pharmacist"
          className="px-4 py-2 rounded border"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          Pharmacist
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 rounded border"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          Log in
        </Link>
        <Link to="/signup" className="px-4 py-2 rounded text-white" style={{ background: "var(--color-primary)" }}>
          Sign up
        </Link>
      </nav>
    </header>
  )
}
