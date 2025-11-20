"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "../lib/api"
import Map from "../shared/Map" // show live preview map

export default function PharmacistDashboard() {
  const [profile, setProfile] = useState({ name: "", address: "" })
  const [item, setItem] = useState({ medicine: "", quantity: 0, price: "" })
  const [inventory, setInventory] = useState([])
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const [coords, setCoords] = useState(null) // hold current coordinates

  useEffect(() => {
    apiFetch("/api/pharmacy/me")
      .then((p) => {
        if (p) {
          setProfile({ name: p.name || "", address: p.address || "" })
          setInventory(p.inventory || [])
          if (p.location?.coordinates?.length === 2) {
            setCoords({ lat: p.location.coordinates[1], lng: p.location.coordinates[0] })
          }
        }
      })
      .catch(() => {})
  }, [])

  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported")
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude })
      },
      (err) => {
        alert("Unable to fetch location. Please allow location access.")
        console.log("[v0] geolocation error:", err?.message)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function saveProfile(e) {
    e.preventDefault()
    setMsg("")
    setError("")
    try {
      const doc = await apiFetch("/api/pharmacy", {
        method: "POST",
        body: JSON.stringify({
          ...profile,
          lat: coords?.lat,
          lng: coords?.lng,
        }),
      })
      setMsg("Profile saved")
      setInventory(doc.inventory || [])
      if (doc.location?.coordinates?.length === 2) {
        setCoords({ lat: doc.location.coordinates[1], lng: doc.location.coordinates[0] })
      }
    } catch (e) {
      setError(e.message)
    }
  }

  async function addItem(e) {
    e.preventDefault()
    setError("")
    try {
      const items = [
        {
          medicine: item.medicine,
          quantity: Number(item.quantity),
          price: item.price ? Number(item.price) : undefined,
        },
      ]
      const doc = await apiFetch("/api/pharmacy/inventory", {
        method: "POST",
        body: JSON.stringify({ items }),
      })
      setInventory(doc.inventory || [])
      setItem({ medicine: "", quantity: 0, price: "" })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Pharmacist Console</h2>
        <div className="text-sm opacity-80">Role: Pharmacist</div>
      </header>

      <form onSubmit={saveProfile} className="rounded border p-4 mb-6">
        <h3 className="font-semibold mb-3">Pharmacy Profile</h3>
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full p-2 rounded border mb-3"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
        <label className="block text-sm mb-1">Address</label>
        <input
          className="w-full p-2 rounded border mb-3"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
        />
        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2 rounded btn-primary">
            Save
          </button>
          <button type="button" onClick={useMyLocation} className="px-4 py-2 rounded btn-outline">
            Use my location
          </button>
          {coords && (
            <span className="text-sm opacity-80">
              lat: {coords.lat.toFixed(5)}, lng: {coords.lng.toFixed(5)}
            </span>
          )}
        </div>
        {msg && (
          <span className="ml-3 text-sm" style={{ color: "var(--color-accent)" }}>
            {msg}
          </span>
        )}
        {error && (
          <span className="ml-3 text-sm" style={{ color: "var(--color-danger)" }}>
            {error}
          </span>
        )}
      </form>

      <div className="map-frame mb-6">
        <Map
          center={coords || undefined}
          markers={coords ? [{ position: coords, title: profile.name || "My Shop" }] : []}
        />
      </div>

      <form onSubmit={addItem} className="rounded border p-4 mb-4">
        <h3 className="font-semibold mb-3">Add/Update Stock</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-sm mb-1">Medicine</label>
            <input
              className="w-full p-2 rounded border"
              value={item.medicine}
              onChange={(e) => setItem({ ...item, medicine: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Qty</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 rounded border"
              value={item.quantity}
              onChange={(e) => setItem({ ...item, quantity: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm mb-1">Price (optional)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full p-2 rounded border"
            value={item.price}
            onChange={(e) => setItem({ ...item, price: e.target.value })}
          />
        </div>
        <button className="mt-3 px-4 py-2 rounded text-white" style={{ background: "var(--color-primary)" }}>
          Save Item
        </button>
      </form>

      <div className="rounded border p-4">
        <h3 className="font-semibold mb-3">Inventory</h3>
        <ul className="grid grid-cols-2 gap-3">
          {inventory.map((i, idx) => (
            <li key={idx} className="rounded border p-3 flex items-center justify-between">
              <span>{i.medicine}</span>
              <span className="text-sm">{i.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
