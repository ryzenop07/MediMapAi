import { Router } from "express"
import { User } from "../models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = Router()

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body as {
      name: string
      email: string
      password: string
      role: "user" | "pharmacist"
    }
    if (!name || !email || !password || !role) return res.status(400).json({ message: "Missing fields" })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: "Email already in use" })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role })
    return res.status(201).json({ id: user._id, email: user.email, role: user.role, name: user.name })
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Server error" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body as { email: string; password: string; role: "user" | "pharmacist" }
    if (!email || !password || !role) return res.status(400).json({ message: "Missing fields" })
    const user = await User.findOne({ email, role })
    if (!user) return res.status(401).json({ message: "Invalid credentials" })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: "Invalid credentials" })
    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" })
    return res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } })
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Server error" })
  }
})

export default router
