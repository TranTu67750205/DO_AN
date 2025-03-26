const express = require("express");
const mqtt = require("mqtt");
const mongoose = require("mongoose");

const app = express();
const port = 5500;

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/Datasensor")
    .then(() => console.log("Kết nối MongoDB thành công"))
    .catch(err => console.error("Lỗi kết nối MongoDB:", err));

const sensorSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  temperature: Number,
  humidity: Number
});

// Tạo Model tương ứng với Collection "sensordatas"
const MyData = mongoose.model("MyData", sensorSchema); 

// Dữ liệu mẫu cần lưu
const sampleData = new MyData({
  temperature: 30.4,
  humidity: 70
});

// Lưu vào MongoDB
sampleData.save()
  .then(() => {
    console.log("Data saved to MongoDB Compass!");
    //mongoose.connection.close(); // Đóng kết nối sau khi lưu
  })
  .catch((err) => console.log("Error saving data:", err));


// Kết nối với Mosquitto MQTT Broker
const MQTT_BROKER = "mqtt://localhost:1883"; // Địa chỉ Mosquitto, làm sao để kiểm tra địa chỉ của mosquitto?
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

// Nhận dữ liệu từ ESP32 qua MQTT
mqttClient.on("message", (topic, message) => {
  console.log(`Nhận dữ liệu từ ${topic}: ${message.toString()}`);

  try {
      const data = JSON.parse(message.toString()); // Chuyển đổi JSON từ ESP32
      const newSensorData = new SensorData({
          temperature: data.temperature,
          humidity: data.humidity
      });

      newSensorData.save()
          .then(() => console.log("Dữ liệu đã lưu vào MongoDB"))
          .catch(err => console.error("Lỗi lưu dữ liệu:", err));
  } catch (error) {
      console.error("Dữ liệu nhận không hợp lệ:", error);
  }
});

// Đặt thư mục public làm thư mục tĩnh
app.use(express.static("public"));

// API để lấy dữ liệu từ MongoDB
app.get("/api/sensor", async (req, res) => {
  try {
      const data = await SensorData.find().sort({ timestamp: -1 }).limit(10);
      res.json(data);
  } catch (err) {
      res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

// REST API: Lưu dữ liệu cảm biến vào MongoDB
app.post("/api/sensors", async (req, res) => {
  const newData = new SensorData(req.body);
  await newData.save();
  res.json({ message: "Data saved successfully!" });
});

// khởi động server 
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:5500/public/index.html`);
});


