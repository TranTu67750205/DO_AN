const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema({
  locationName: String,
  createdBy: String,
  devices: [String],
  createdAt: { type: Date, default: Date.now }
}); 

const Sitedata = mongoose.model("Site", siteSchema);
module.exports = Sitedata;


                       
                                                                  