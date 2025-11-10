import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get("query") || "").trim()
  const now = Date.now()

  // Simulated dataset for demo purposes
  const seed = query.length || 1
  const rand = (min: number, max: number) => min + ((((now % 1000) + seed * 31) % 1000) / 1000) * (max - min)

  const pharmacies = [
    {
      id: "ph1",
      name: "CityCare Pharmacy",
      address: "12 Main St",
      lat: 28.6139 + (rand(-0.02, 0.02) - 0.01),
      lng: 77.209 + (rand(-0.02, 0.02) - 0.01),
      distanceKm: rand(0.5, 6.0),
      stock: Math.floor(rand(0, 40)),
    },
    {
      id: "ph2",
      name: "HealthPlus Chemists",
      address: "220 Oak Ave",
      lat: 28.6139 + (rand(-0.02, 0.02) - 0.008),
      lng: 77.209 + (rand(-0.02, 0.02) + 0.006),
      distanceKm: rand(0.4, 8.0),
      stock: Math.floor(rand(0, 25)),
    },
    {
      id: "ph3",
      name: "Neighborhood Pharmacy",
      address: "78 Lake Rd",
      lat: 28.6139 + (rand(-0.02, 0.02) + 0.004),
      lng: 77.209 + (rand(-0.02, 0.02) - 0.004),
      distanceKm: rand(1.0, 10.0),
      stock: Math.floor(rand(0, 15)),
    },
  ].map((p) => ({ ...p, hasMedicine: p.stock > 0 }))

  const alternatesBase = ["Paracetamol 650", "Acetaminophen 650", "Ibuprofen 400", "Naproxen 250"]

  const alternates = alternatesBase
    .filter((name) => name.toLowerCase() !== query.toLowerCase())
    .slice(0, 3)
    .map((name, i) => ({
      name,
      hasStock: (now + i) % 2 === 0,
    }))

  return Response.json({
    query,
    pharmacies,
    alternates,
  })
}
