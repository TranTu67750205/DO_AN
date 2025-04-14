const express = require('express');
const router = express.Router();
const VerifyRequest = require('../models/devicemodel');

// GET /api/unverified-devices
router.get("/unverified-devices", async (req, res) => {
    try {
      const devices = await VerifyRequest.find({ verified: false, type: 'id' }).sort({ timestamp: -1 });
      res.json(devices);
    } catch (err) {
      console.error('Lỗi lấy danh sách thiết bị chưa xác minh:', err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  });
  
router.get("/verified-devices", async (req, res) => {
    const { id } = req.query;
  
    if (!id) {
      return res.status(400).send("Thiếu ID để xác minh.");
    }
  
    try {
      const device = await VerifyRequest.findOne({ id });
  
      if (!device) {
        return res.status(404).send("Không tìm thấy thiết bị.");
      }
  
      if (device.verified) {
        return res.send("✅ Thiết bị đã được xác minh trước đó.");
      }
  
      device.verified = true;
      await device.save();
  
      return res.send("✅ Thiết bị đã được xác minh thành công!");
    } catch (err) {
      console.error("❌ Lỗi xác minh thiết bị:", err);
      res.status(500).send("Lỗi máy chủ.");
    }
  });

  module.exports = router;