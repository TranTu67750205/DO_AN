// server/routes/sites.js
const express = require("express");
const router = express.Router();
const Site = require("../models/sitemodel");

// Helper: xác định trạng thái thiết bị
function getDeviceStatus(lastActive) {
  const now = Date.now();
  const diff = now - new Date(lastActive).getTime();
  return diff < 60000 ? "Hoạt động" : "Không hoạt động";
}

// Lấy danh sách tất cả site kèm device + trạng thái
router.get("/", async (req, res) => {
  try {
    const sites = await Site.find();
    const sitesWithStatus = sites.map((site) => {
      const updatedDevices = site.devices.map((device) => ({
        ...device.toObject(),
        status: getDeviceStatus(device.lastActive),
      }));
      return {
        ...site.toObject(),
        devices: updatedDevices,
      };
    });
    res.json(sitesWithStatus);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách site" });
  }
});

// Tạo site mới
router.post("/add", async (req, res) => {
  const { name, createdBy, devices } = req.body;
  try {
    const newSite = new Site({
      locationName,
      createdAt: new Date(),
      createdBy,
      devices: devices || [],
    });
    await newSite.save();
    res.json({ message: "Tạo site thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi tạo site" });
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
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Site.findByIdAndDelete(id);
    res.json({ message: "Xóa site thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi xóa site" });
  }
});

module.exports = router;
