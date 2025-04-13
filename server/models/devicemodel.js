const mongoose = require("mongoose");

const verifySchema = new mongoose.Schema({ 
  type: String, 
  id: String,
  timestamp: { type: Date, default: Date.now },
  raw: Object
});

const IDVerification = mongoose.model("IDVerify", verifySchema);
module.exports = IDVerification;