"use client"

import { motion } from "framer-motion"

export function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-balance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Your trusted medicine finder
          </motion.h1>
          <motion.p
            className="mt-4 text-lg md:text-xl text-muted-foreground max-w-prose"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover availability, compare prices, and get what you need from nearby pharmacies.
          </motion.p>
        </div>

        <motion.div
          className="flex-1"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <img
            src="/images/hero.jpg"
            alt="Healthcare hero"
            className="w-full h-auto rounded-xl border border-border object-cover"
          />
        </motion.div>
      </div>
    </header>
  )
}
