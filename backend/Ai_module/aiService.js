const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const Fuse = require("fuse.js");

const datasetPath = path.join(__dirname, "medicine_dataset.csv");
const cachePath = path.join(__dirname, "embeddings_cache.json");

let medicines = [];
let embeddingsCache = {};
let fuse = null;

// Load embeddings cache if available
if (fs.existsSync(cachePath)) {
  embeddingsCache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  console.log(`[AI] Loaded cached embeddings for ${Object.keys(embeddingsCache).length} medicines`);
}

// Load medicines
fs.createReadStream(datasetPath)
  .pipe(csv())
  .on("data", (row) => {
    if (row.name) medicines.push(row);
  })
  .on("end", () => {
    console.log(`[AI] Loaded ${medicines.length} medicines from dataset`);

    // Build fuzzy search index for typo tolerance
    fuse = new Fuse(medicines, {
      keys: ["name"],
      threshold: 0.3, // smaller = stricter match
    });

    console.log(`[AI] Fuzzy search ready ✅`);
  });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embeddings lazily (not blocking startup)
async function generateEmbeddingLazy(name) {
  try {
    if (embeddingsCache[name]) return embeddingsCache[name];
    const embedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: name,
    });
    embeddingsCache[name] = embedding.data[0].embedding;
    fs.writeFileSync(cachePath, JSON.stringify(embeddingsCache, null, 2));
    return embeddingsCache[name];
  } catch (err) {
    console.error("[AI] Skipping embedding for:", name, "-", err.message);
    return null;
  }
}

// Cosine similarity helper
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function suggestMedicineAI(query) {
  try {
    if (!query || medicines.length === 0) return [];

    // 🔍 1️⃣ Try fuzzy search first
    const fuzzyResults = fuse.search(query).slice(0, 5);
    if (fuzzyResults.length > 0) {
      return fuzzyResults.map((r) => ({
        name: r.item.name,
        substitutes: [
          r.item.substitute0,
          r.item.substitute1,
          r.item.substitute2,
          r.item.substitute3,
          r.item.substitute4,
        ].filter(Boolean),
        uses: [r.item.use0, r.item.use1, r.item.use2, r.item.use3, r.item.use4].filter(Boolean),
      }));
    }

    // 🧠 2️⃣ Fallback to embeddings (AI semantic match)
    const queryEmbedding = await generateEmbeddingLazy(query);
    if (!queryEmbedding) return [];

    const ranked = medicines
      .filter((m) => embeddingsCache[m.name])
      .map((m) => ({
        name: m.name,
        similarity: cosineSimilarity(queryEmbedding, embeddingsCache[m.name]),
        substitutes: [
          m.substitute0,
          m.substitute1,
          m.substitute2,
          m.substitute3,
          m.substitute4,
        ].filter(Boolean),
        uses: [m.use0, m.use1, m.use2, m.use3, m.use4].filter(Boolean),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return ranked;
  } catch (err) {
    console.error("[AI Service] Error:", err.message);
    return [];
  }
}

module.exports = { suggestMedicineAI };
