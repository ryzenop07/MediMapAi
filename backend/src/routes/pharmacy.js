const router = require("express").Router()
const { z } = require("zod")
const Pharmacy = require("../models/Pharmacy")
const auth = require("../middleware/auth")

const PharmacySchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

const InventorySchema = z.object({
  items: z
    .array(
      z.object({
        medicine: z.string().min(1),
        quantity: z.number().int().min(0),
        price: z.number().min(0).optional(),
      }),
    )
    .min(1),
})

// Create or update pharmacy
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "pharmacist") return res.status(403).json({ message: "Forbidden" })
    const body = PharmacySchema.parse(req.body)

    let coordinates
    if (typeof body.lat === "number" && typeof body.lng === "number") {
      coordinates = [body.lng, body.lat]
    } else if (body.address) {
      const key = process.env.GOOGLE_MAPS_API_KEY
      if (!key) return res.status(400).json({ message: "Missing lat/lng and GOOGLE_MAPS_API_KEY for geocoding" })
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(body.address)}&key=${key}`
      const geo = await fetch(url).then((r) => r.json())
      const loc = geo?.results?.[0]?.geometry?.location
      if (!loc) return res.status(400).json({ message: "Unable to geocode address" })
      coordinates = [loc.lng, loc.lat]
    } else {
      return res.status(400).json({ message: "Provide either lat/lng or address" })
    }

    const doc = await Pharmacy.findOneAndUpdate(
      { owner: req.user.id },
      {
        owner: req.user.id,
        name: body.name,
        address: body.address,
        phone: body.phone,
        location: { type: "Point", coordinates },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
    return res.status(200).json(doc)
  } catch (err) {
    const msg = err?.issues?.[0]?.message || err.message || "Invalid request"
    return res.status(400).json({ message: msg })
  }
})

// Upsert inventory
router.post("/inventory", auth, async (req, res) => {
  try {
    if (req.user.role !== "pharmacist") return res.status(403).json({ message: "Forbidden" })
    const body = InventorySchema.parse(req.body)
    const pharmacy = await Pharmacy.findOne({ owner: req.user.id })
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found. Create it first." })

    body.items.forEach((it) => (it.medicine = it.medicine.toLowerCase().trim()))
    const map = new Map(pharmacy.inventory.map((it) => [it.medicine, it]))

    for (const item of body.items) {
      const existing = map.get(item.medicine)
      if (existing) {
        existing.quantity = item.quantity
        if (typeof item.price === "number") existing.price = item.price
      } else {
        map.set(item.medicine, item)
      }
    }
    pharmacy.inventory = Array.from(map.values())
    await pharmacy.save()
    return res.json(pharmacy)
  } catch (err) {
    const msg = err?.issues?.[0]?.message || err.message || "Invalid request"
    return res.status(400).json({ message: msg })
  }
})

// Fetch pharmacist's pharmacy document
router.get("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "pharmacist") return res.status(403).json({ message: "Forbidden" })
    const doc = await Pharmacy.findOne({ owner: req.user.id })
    return res.json(doc || null)
  } catch (err) {
    return res.status(400).json({ message: err.message || "Invalid request" })
  }
})

module.exports = router
