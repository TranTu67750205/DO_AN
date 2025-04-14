const mongoose = require("mongoose");

const verifySchema = new mongoose.Schema({ 
  type: String, 
  id: String,
  timestamp: { type: Date, default: Date.now },
  raw: Object,
  verified: {
    type: Boolean,
    default: false
  }
});

const IDVerification = mongoose.model("IDVerify", verifySchema);
module.exports = IDVerification;