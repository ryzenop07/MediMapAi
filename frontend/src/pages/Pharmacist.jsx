"use client"
import { useState } from "react"

export default function Pharmacist() {
  const [form, setForm] = useState({ name: "", address: "", phone: "", lat: "", lng: "" })
  const [items, setItems] = useState([{ medicine: "", quantity: 0, price: "" }])
  const [loading, setLoading] = useState(false)
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

  function onChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
  }
  function addItem() {
    setItems((s) => [...s, { medicine: "", quantity: 0, price: "" }])
  }
  function updateItem(i, key, val) {
    setItems((s) => {
      const copy = [...s]
      copy[i] = { ...copy[i], [key]: val }
      return copy
    })
  }

  async function savePharmacy(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${base}/api/pharmacy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          address: form.address || undefined,
          phone: form.phone || undefined,
          lat: form.lat ? Number(form.lat) : undefined,
          lng: form.lng ? Number(form.lng) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to save pharmacy")
      alert("Pharmacy saved")
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveInventory(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const payload = {
        items: items
          .filter((it) => it.medicine.trim())
          .map((it) => ({
            medicine: it.medicine,
            quantity: Number(it.quantity) || 0,
            price: it.price ? Number(it.price) : undefined,
          })),
      }
      const res = await fetch(`${base}/api/pharmacy/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to save inventory")
      alert("Inventory saved")
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Pharmacist Dashboard</h1>
      <form onSubmit={savePharmacy} className="rounded-lg border p-4 mb-6">
        <h2 className="font-semibold mb-2">Pharmacy Details</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            name="name"
            placeholder="Name"
            className="p-2 rounded border"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            className="p-2 rounded border"
            value={form.phone}
            onChange={onChange}
          />
          <input
            name="address"
            placeholder="Address (optional if lat/lng provided)"
            className="p-2 rounded border md:col-span-2"
            value={form.address}
            onChange={onChange}
          />
          <input
            name="lat"
            placeholder="Latitude"
            className="p-2 rounded border"
            value={form.lat}
            onChange={onChange}
          />
          <input
            name="lng"
            placeholder="Longitude"
            className="p-2 rounded border"
            value={form.lng}
            onChange={onChange}
          />
        </div>
        <button
          className="mt-3 px-4 py-2 rounded text-white"
          style={{ background: "var(--color-primary)" }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Pharmacy"}
        </button>
      </form>

      <form onSubmit={saveInventory} className="rounded-lg border p-4">
        <h2 className="font-semibold mb-2">Inventory</h2>
        {items.map((it, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-3 mb-3">
            <input
              placeholder="Medicine name"
              className="p-2 rounded border"
              value={it.medicine}
              onChange={(e) => updateItem(i, "medicine", e.target.value)}
            />
            <input
              type="number"
              placeholder="Quantity"
              className="p-2 rounded border"
              value={it.quantity}
              onChange={(e) => updateItem(i, "quantity", e.target.value)}
            />
            <input
              type="number"
              placeholder="Price (optional)"
              className="p-2 rounded border"
              value={it.price}
              onChange={(e) => updateItem(i, "price", e.target.value)}
            />
          </div>
        ))}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 rounded border"
            style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
          >
            Add Item
          </button>
          <button
            className="px-4 py-2 rounded text-white"
            style={{ background: "var(--color-primary)" }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Inventory"}
          </button>
        </div>
      </form>
    </main>
  )
}
