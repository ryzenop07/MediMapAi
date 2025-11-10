const jwt = require("jsonwebtoken")

module.exports = function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || ""
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null
    if (!token) return res.status(401).json({ message: "Missing token" })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}
