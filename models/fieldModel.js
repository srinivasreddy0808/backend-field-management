const mongoose = require("mongoose");
const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  cropType: {
    type: String,
    required: true,
  },
  areaSize: {
    type: Number,
    required: true,
  },
  soilHealth: {
    ph: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    lastUpdated: Date,
  },
  cropHealth: {
    status: String,
    diseaseRisk: String,
    waterStress: String,
    lastUpdated: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Field", fieldSchema);
