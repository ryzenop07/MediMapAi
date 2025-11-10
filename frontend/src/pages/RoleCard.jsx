"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function RoleCard({
  title = "Role",
  desc = "Role description",
  login = "/login",
  signup = "/signup",
  image = "/images/medicine-bottle.jpg",
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="rounded-lg p-6 border flex flex-col gap-4"
      style={{ borderColor: "rgba(2,6,23,0.1)" }}
    >
      <div className="flex items-center gap-3">
        <img
          src={image || "/placeholder.svg"}
          alt={`${title} illustration`}
          className="h-10 w-10 rounded-md object-cover"
        />
        <h3 className="text-2xl font-semibold">{title}</h3>
      </div>
      <p className="opacity-80">{desc}</p>
      <div className="flex gap-3">
        <Link
          to={login}
          className="px-4 py-2 rounded border"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          Log in
        </Link>
        <Link to={signup} className="px-4 py-2 rounded text-white" style={{ background: "var(--color-primary)" }}>
          Sign up
        </Link>
      </div>
    </motion.div>
  )
}
