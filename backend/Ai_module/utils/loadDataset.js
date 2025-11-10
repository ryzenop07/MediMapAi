const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

function loadDataset() {
  return new Promise((resolve, reject) => {
    const results = [];
    const datasetPath = path.join(__dirname, "../medicine_dataset.csv");

    if (!fs.existsSync(datasetPath)) {
      console.error("[AI] Dataset file not found at:", datasetPath);
      return resolve([]);
    }

    fs.createReadStream(datasetPath)
      .pipe(csv())
      .on("data", (row) => {
        // Basic cleaning
        const name = (row.name || "").trim().toLowerCase();
        if (!name) return; // Skip empty names

        // Extract relevant info
        const substitutes = Object.keys(row)
          .filter((k) => k.startsWith("substitute") && row[k])
          .map((k) => row[k].trim());

        const sideEffects = Object.keys(row)
          .filter((k) => k.startsWith("sideEffect") && row[k])
          .map((k) => row[k].trim());

        const uses = Object.keys(row)
          .filter((k) => k.startsWith("use") && row[k])
          .map((k) => row[k].trim());

        results.push({
          id: row.id,
          name,
          substitutes,
          sideEffects,
          uses,
          chemicalClass: row["Chemical Class"] || "NA",
          habitForming: row["Habit Forming"] || "No",
          therapeuticClass: row["Therapeutic Class"] || "NA",
          actionClass: row["Action Class"] || "NA",
        });
      })
      .on("end", () => {
        console.log(`[AI] Loaded ${results.length} medicines from dataset`);
        resolve(results);
      })
      .on("error", reject);
  });
}

module.exports = loadDataset;
