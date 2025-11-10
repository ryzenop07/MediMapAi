const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { z } = require("zod")
const User = require("../models/User")

const SignupSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password should be at least 6 chars"),
  role: z.enum(["user", "pharmacist"]),
})

const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password should be at least 6 chars"),
  role: z.enum(["user", "pharmacist"]),
})

router.post("/signup", async (req, res) => {
  try {
    const body = SignupSchema.parse(req.body)
    const exists = await User.findOne({ email: body.email })
    if (exists) return res.status(409).json({ message: "Email already in use" })
    const hash = await bcrypt.hash(body.password, 10)
    const user = await User.create({ ...body, password: hash })
    return res.status(201).json({ id: user._id })
  } catch (err) {
    const message = err?.issues?.[0]?.message || err.message || "Invalid request"
    return res.status(400).json({ message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const body = LoginSchema.parse(req.body)
    const user = await User.findOne({ email: body.email, role: body.role })
    if (!user) return res.status(404).json({ message: "Account not found" })
    const ok = await bcrypt.compare(body.password, user.password)
    if (!ok) return res.status(401).json({ message: "Invalid credentials" })
    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })
    return res.json({ token })
  } catch (err) {
    const message = err?.issues?.[0]?.message || err.message || "Invalid request"
    return res.status(400).json({ message })
  }
})

module.exports = router
