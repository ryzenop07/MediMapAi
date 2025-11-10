const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// ✅ Initialize express FIRST
const app = express();

// ✅ Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin(origin, cb) {
      const extra = (process.env.CORS_ORIGIN || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const allowRegex = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/; // dev: any port
      if (!origin || allowRegex.test(origin) || extra.includes(origin)) {
        return cb(null, true);
      }
      console.log("[backend][CORS] blocked origin:", origin); // debug
      return cb(new Error("CORS not allowed"), false);
    },
    credentials: true,
  })
);

// ✅ Import routes AFTER app is defined
const aiRoutes = require("./routes/ai");
const authRoutes = require("./src/routes/auth");
const pharmacyRoutes = require("./src/routes/pharmacy");
const searchRoutes = require("./src/routes/search");

// ✅ Route registration
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/search", searchRoutes);

// ✅ MongoDB connection
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || "medicine_search",
  })
  .then(() => {
    console.log("[backend] Connected to MongoDB db:", process.env.MONGODB_DB || "medicine_search");
    app.listen(Number(PORT), () =>
      console.log(`[backend] API running on :${PORT}`)
    );
  })
  .catch((err) => {
    console.error("[backend] MongoDB connection error:", err.message);
    process.exit(1);
  });
