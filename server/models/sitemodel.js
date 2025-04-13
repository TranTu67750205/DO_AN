const mongoose = require("mongoose");
const deviceSchema = new mongoose.Schema({
  deviceId: String,
  lastActive: { type: Date, default: Date.now }, // Nếu cần
});

const siteSchema = new mongoose.Schema({
  locationName: String,
  createdBy: String,
  devices: [deviceSchema],
  createdAt: { type: Date, default: Date.now }
});

const Sitedata = mongoose.model("Site", siteSchema);
module.exports = Sitedata;