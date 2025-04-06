const express = require("express");
const mqtt = require("mqtt");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = 3000; 

// Đọc dữ liệu JSON từ request
app.use(express.json());

// Cho phép CORS để web có thể gọi API từ trình duyệt, dòng lệnh này rất quan trọng 
app.use(cors());

// Đặt thư mục public làm thư mục tĩnh
app.use(express.static("public"));

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/Datasensor")
    .then(() => console.log("Kết nối MongoDB thành công"))
    .catch(err => console.error("Lỗi kết nối MongoDB:", err));

const sensorSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  temperature: Number,
  humidity: Number
});

// Tạo Model tương ứng với Collection "Mydata"
const MyData = mongoose.model("MyData", sensorSchema); 

// Dữ liệu mẫu cần lưu
const sampleData = new MyData({
  temperature: 30.4,
  humidity: 75
});

// Lưu vào MongoDB
sampleData.save()
  .then(() => {
    console.log("Data saved to MongoDB Compass!");
    //mongoose.connection.close(); // Đóng kết nối sau khi lưu
  })
  .catch((err) => console.log("Error saving data:", err));


// Kết nối với Mosquitto MQTT Broker
const MQTT_BROKER = "mqtt://192.168.1.8:1883"; // Địa chỉ Mosquitto, làm sao để kiểm tra địa chỉ của mosquitto?
const MQTT_TOPIC = "sensor/data"; // Topic ESP32 gửi dữ liệu

const mqttClient = mqtt.connect(MQTT_BROKER);

// Khi kết nối thành công với MQTT Broker
mqttClient.on("connect", () => {
    console.log("Đã kết nối với MQTT Broker");
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
            console.log(`Đã subscribe topic: ${MQTT_TOPIC}`);
        }
    });
});

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


// Nhận dữ liệu từ ESP32 qua MQTT
mqttClient.on("message", (topic, message) => {
  console.log(`Nhận dữ liệu từ ${topic}: ${message.toString()}`);

  try {
      const data = JSON.parse(message.toString()); // Chuyển đổi JSON từ ESP32
      const newSensorData = new ESPdata({
        id: data.id,
        temperature: data.temp,
        humidity: data.hum,
        soil: data.soil,
        uv: data.uv
      });

      newSensorData.save()
          .then(() => console.log("Dữ liệu đã lưu vào MongoDB"))
          .catch(err => console.error("Lỗi lưu dữ liệu:", err));
  } catch (error) {
      console.error("Dữ liệu nhận không hợp lệ:", error);
  }
});


// API để lấy dữ liệu từ MongoDB
app.get("/api/sensors", async (req, res) => {
  try {
      const data = await ESPdata.find().sort({ timestamp: -1 }).limit(10);
      res.json(data);
  } catch (err) {
      res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

// khởi động server 
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});


