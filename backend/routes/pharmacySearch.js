const express = require("express");
const router = express.Router();
const Pharmacy = require("../src/models/Pharmacy");

// GET /api/pharmacy/search?medicine=<name>&lat=<lat>&lng=<lng>
router.get("/search", async (req, res) => {
  try {
    const { medicine, lat, lng } = req.query;
    if (!medicine) return res.status(400).json({ error: "Medicine name required" });

    const query = {
      "inventory.medicine": medicine.toLowerCase(),
    };

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 50000, // 50 km radius
        },
      };
    }

    const pharmacies = await Pharmacy.find(query).limit(10);

    res.status(200).json({
      pharmacies: pharmacies.map((p) => ({
        name: p.name,
        address: p.address,
        phone: p.phone,
        location: { lat: p.location.coordinates[1], lng: p.location.coordinates[0] },
        stock: p.inventory.find((i) => i.medicine === medicine.toLowerCase())?.quantity || 0,
      })),
    });
  } catch (err) {
    console.error("[Pharmacy Search Error]:", err);
    res.status(500).json({ error: "Failed to search pharmacies" });
  }
});

module.exports = router;
