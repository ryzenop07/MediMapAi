const express = require("express");
const router = express.Router();
const { suggestMedicineAI } = require("../Ai_module/aiService");

router.get("/suggest", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const suggestions = await suggestMedicineAI(query);

    if (!suggestions || suggestions.length === 0) {
      return res.status(200).json({
        message: `No medicine found for "${query}".`,
        suggestions: [],
      });
    }

    res.status(200).json({ suggestions });
  } catch (err) {
    console.error("[AI Route Error]:", err);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

module.exports = router;
