"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "../lib/api";
import Map from "../shared/Map";

export default function PatientDashboard() {
  const [q, setQ] = useState("");
  const [pos, setPos] = useState(null);
  const [results, setResults] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧭 Load initial location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {
          console.warn("Using fallback location (Delhi)");
          setPos({ lat: 28.6139, lng: 77.2090 }); // fallback (Delhi)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setPos({ lat: 28.6139, lng: 77.2090 }); // fallback if no geolocation
    }
  }, []);

  // 🔍 Handle medicine search
  async function onSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setAiSuggestions([]);
    try {
      if (!pos) throw new Error("Enable location to search nearby");
      const data = await apiFetch(
        `/api/search?query=${encodeURIComponent(q)}&lat=${pos.lat}&lng=${pos.lng}`
      );

      // Handle both DB results and AI suggestions
      if (data.found) {
        setResults(data.results || []);
      } else if (data.suggestions) {
        setResults([]);
        setAiSuggestions(data.suggestions);
      } else {
        setResults([]);
        setError("Medicine not found. Try checking spelling or nearby areas.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // 📍 Manually use location
  async function onUseMyLocation() {
    if (!navigator.geolocation) return setError("Geolocation not supported");
    setError("");
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => {
        if (err.code === 1) setError("Location permission denied. Please allow access.");
        else if (err.code === 2) setError("Location unavailable. Try again later.");
        else setError("Unable to get location. Please enable GPS.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // 📌 Map markers
  const markers = useMemo(() => {
    return (results || [])
      .map((r) => {
        const coords = r?.location?.coordinates;
        if (!coords || coords.length < 2) return null;
        return {
          position: { lat: coords[1], lng: coords[0] },
          title: r.name,
          description: `${r.address || ""} · ${(r.distance / 1000).toFixed(1)} km`,
        };
      })
      .filter(Boolean);
  }, [results]);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* 🧠 Header */}
      <motion.header
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-blue-600">Find Your Medicine</h2>
        <div className="text-sm opacity-80 bg-gray-100 px-3 py-1 rounded-lg">
          Role: <strong>Patient</strong>
        </div>
      </motion.header>

      {/* 🔍 Search Form */}
      <form
        onSubmit={onSearch}
        className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-4 rounded-2xl shadow-md"
      >
        <input
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search medicine (e.g., Crocin)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            {loading ? "Searching..." : "Search"}
          </motion.button>

          <motion.button
            type="button"
            onClick={onUseMyLocation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border hover:bg-gray-200 transition"
          >
            📍 Use My Location
          </motion.button>
        </div>
      </form>

      {/* ⚠️ Error Message */}
      {error && (
        <motion.p
          className="mb-4 text-sm text-red-600 bg-red-100 px-4 py-2 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* 🏥 Pharmacy List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xl font-semibold mb-3">Nearby Pharmacies</h3>
          <ul className="space-y-3">
            {results.length > 0 ? (
              results.map((r) => (
                <motion.li
                  key={r._id}
                  className="rounded-xl border p-4 shadow-sm hover:shadow-lg transition bg-white"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="font-semibold text-lg text-blue-700">{r.name}</div>
                  <div className="text-sm opacity-80">{r.address}</div>
                  <div className="text-sm mt-1">{(r.distance / 1000).toFixed(1)} km away</div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${r.location.coordinates[1]},${r.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:underline text-sm font-medium"
                  >
                    🚗 Get Directions
                  </a>
                </motion.li>
              ))
            ) : aiSuggestions.length > 0 ? (
              <div className="bg-blue-50 p-4 rounded-xl border">
                <h4 className="text-blue-700 font-semibold mb-2">
                  Medicine not available nearby — AI suggests:
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                  {aiSuggestions.map((m, i) => (
                    <li key={i}>
                      <strong>{m.name}</strong>
                      {m.substitutes?.length > 0 && (
                        <span className="block text-gray-500 text-xs">
                          Alternatives: {m.substitutes.join(", ")}
                        </span>
                      )}
                      {m.uses?.length > 0 && (
                        <span className="block text-gray-500 text-xs">
                          Uses: {m.uses.join(", ")}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No results yet. Try searching a medicine.</p>
            )}
          </ul>
        </motion.div>

        {/* 🗺️ Map */}
        <motion.div
          className="map-frame rounded-2xl overflow-hidden shadow-lg border"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Map center={pos || undefined} markers={markers} />
        </motion.div>
      </div>
    </main>
  );
}
