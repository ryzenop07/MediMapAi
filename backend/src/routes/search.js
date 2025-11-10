const router = require("express").Router();
const { z } = require("zod");
const Pharmacy = require("../models/Pharmacy");
const { suggestMedicineAI } = require("../../Ai_module/aiService");

const SearchSchema = z.object({
  query: z.string().min(1),
  lat: z.preprocess((v) => Number(v), z.number()),
  lng: z.preprocess((v) => Number(v), z.number()),
});

router.get("/", async (req, res) => {
  try {
    const { query, lat, lng } = SearchSchema.parse(req.query);

    // 🔍 Step 1: Search MongoDB for nearby pharmacies with the medicine
    const results = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          spherical: true,
          key: "location",
          query: {
            "inventory.medicine": { $regex: query, $options: "i" },
            "inventory.quantity": { $gt: 0 },
          },
        },
      },
      {
        $project: {
          name: 1,
          address: 1,
          phone: 1,
          location: 1,
          distance: 1,
          items: {
            $filter: {
              input: "$inventory",
              as: "it",
              cond: {
                $and: [
                  { $regexMatch: { input: "$$it.medicine", regex: query, options: "i" } },
                  { $gt: ["$$it.quantity", 0] },
                ],
              },
            },
          },
        },
      },
      { $limit: 20 },
    ]);

    // ✅ Step 2: Return database results if found
    if (results.length > 0) {
      return res.json({ found: true, results });
    }

    // 🤖 Step 3: Otherwise, use AI to suggest alternatives
    console.log(`[AI] No DB results for "${query}". Getting AI suggestions...`);
    const aiSuggestions = await suggestMedicineAI(query);

    // ✅ Step 4: Return AI suggestions if found
    if (aiSuggestions && aiSuggestions.length > 0) {
      return res.json({
        found: false,
        message: "Medicine not found nearby. Here are some AI-based alternatives:",
        suggestions: aiSuggestions,
      });
    }

    // ❌ Step 5: Nothing found at all
    return res.status(404).json({
      found: false,
      message:
        "No nearby pharmacies have this medicine, and AI couldn't find any alternatives. Try another name or spelling.",
      suggestions: [],
    });
  } catch (err) {
    console.error("[Search Route Error]:", err);
    const msg = err?.issues?.[0]?.message || err.message || "Invalid request";
    return res.status(400).json({ message: msg });
  }
});

module.exports = router;
