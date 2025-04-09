const mongoose = require("mongoose");

// Định nghĩa Schema mới cho MongoDB
  const dataSchema = new mongoose.Schema({
    id: String,                     // ID của EndNode
    temperature: Number,            // Nhiệt độ
    humidity: Number,               // Độ ẩm
    soil: Number,                   // Độ ẩm đất
    uv: Number,                     // Cường độ UV
    timestamp: { type: Date, default: Date.now } // Tự động ghi thời gian lưu
  });

// Tạo Model tương ứng với Collection "ESPdata"
const ESPdata = mongoose.model("ESPdata", dataSchema); 
// Xuất model ra để dùng ở file khác
module.exports = ESPdata;