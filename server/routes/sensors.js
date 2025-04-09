const express = require("express");
const router = express.Router();
const ESPdata = require("../models/sensormodel");

// API để lấy dữ liệu từ MongoDB
router.get("/sensors", async (req, res) => {
    try {
      const data = await ESPdata.find().sort({ timestamp: -1 }).limit(10);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Lỗi lấy dữ liệu" });
    }
  });
  
module.exports = router;