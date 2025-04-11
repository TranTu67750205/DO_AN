const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema({
  locationName: String,
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
  devices: String,
});

module.exports = mongoose.model("Site", siteSchema);