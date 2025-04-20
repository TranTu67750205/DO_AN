// server/routes/sites.js
const express = require("express");
const router = express.Router();
const Sitedata = require("../models/sitemodel");
const device_verifi = require("../models/devicemodel");
const ESPdata = require("../models/sensormodel");


//lấy danh sách devices 
router.get("/devices_verified", async (req, res) => {  
  try {
    // 1. Lấy tất cả thiết bị đã xác minh
    const verifiedDevices = await device_verifi.find({ "verified": true });
    const verifiedIds = verifiedDevices.map(d => d.id);

    // 2. Lấy tất cả thiết bị đã được gán vào site
    const usedDevices = await Sitedata.distinct("devices");

    // 3. Lọc ra thiết bị chưa gán vào site nào
    const availableIds = verifiedIds.filter(id => !usedDevices.includes(id));

    // 4. Trả về mảng object chứa id (nếu frontend cần)
    const result = availableIds.map(id => ({ id }));
    res.json(result);
    console.log("📊 Kết quả device:", result);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

// Lấy danh sách tất cả site kèm device 
router.get("/load", async (req, res) => {  
  try {
    const data = await Sitedata.find().limit(10);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

// Tạo site mới
router.post("/add", async (req, res) => {
  const { locationName, createdBy, devices } = req.body;
  try {
    const site = new Sitedata({
      locationName,
      createdBy,
      devices,
    });

    await site.save();
    res.json({ message: "Tạo site thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi tạo site" });
  }
});

const THRESHOLD_MINUTES = 1;

router.post("/status-devices", async (req, res) => {
  try {
    const { deviceIds } = req.body;
    const statuses = [];

    // Lấy 20 bản ghi mới nhất từ toàn bộ ESPdata
    //const recentRecords = await ESPdata.find().sort({ timestamp: -1 }).limit(20);
    const now = new Date();

    for (const id of deviceIds) {
      const latestRecord = await ESPdata.findOne({ id }).sort({ timestamp: -1 });

      if (latestRecord) {
        const diffMs = now - new Date(latestRecord.timestamp);
        const diffMinutes = diffMs / (1000 * 60);

        const isActive = diffMinutes <= THRESHOLD_MINUTES;
        statuses.push({
          deviceId: id,
          status: isActive ? "🟢 Online" : "🔴 Offline",
          lastSeen: latestRecord.timestamp,
        });
      }
      else {
        statuses.push({
          deviceId: id,
          status: "🔴 Offline",
          lastSeen: null,
        });
      }
    }
    console.log("📊 Kết quả trạng thái:", statuses);

    res.json(statuses);
  } catch (err) {
    console.error("Lỗi truy vấn trạng thái thiết bị:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// Cập nhật thông tin site (có thể sửa tên, danh sách device)
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, devices } = req.body;
  try {
    await Site.findByIdAndUpdate(id, { name, devices });
    res.json({ message: "Cập nhật site thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật site" });
  }
});

// Xóa site
router.delete("/delete/:siteId", async (req, res) => {
  try {
    const siteId = req.params.siteId;
    console.log("📊 Kết quả ID của site cần xóa:", siteId);

    const deleted = await Sitedata.findByIdAndDelete(siteId);

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy site để xóa" });
    }

    res.json({ message: "Đã xóa site thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa site:", err);
    res.status(500).json({ error: "Lỗi máy chủ khi xóa site" });
  }
});

module.exports = router;
