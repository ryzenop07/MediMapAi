const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, lowercase: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, min: 0 },
  },
  { _id: false },
)

const pharmacySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere", required: true }, // [lng, lat]
    },
    inventory: [inventorySchema],
  },
  { timestamps: true },
)

pharmacySchema.index({ location: "2dsphere" })
pharmacySchema.index({ "inventory.medicine": 1 })

module.exports = mongoose.model("Pharmacy", pharmacySchema)
