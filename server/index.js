  const express = require("express");
  const mqtt = require("mqtt");
  const cors = require("cors");
  const app = express();
  const port = 3000;
  const mongoose = require("mongoose");
  //import model ESPdata
  const ESPdata = require("./models/sensormodel");

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

  // Kết nối với Mosquitto MQTT Broker
  const MQTT_BROKER = "mqtt://192.168.1.139:1883"; // Địa chỉ Mosquitto, làm sao để kiểm tra địa chỉ của mosquitto?
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
      // Chuyển đổi JSON từ ESP32
        const data = JSON.parse(message.toString()); 
        const deviceId = data.id;

        // Cập nhật thời gian hoạt động của thiết bị
        /*
        Site.updateOne(
          { "devices.deviceId": deviceId },
          { $set: { "devices.$.lastActive": new Date() } }
        );*/ 

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

  // API để lấy dữ liệu từ collection espdatas 
  const sensorRoutes = require("./routes/sensors");
  app.use("/api", sensorRoutes);

  // API lấy dữ liệu từ collection users 
  const userRoutes = require("./routes/user");
  app.use("/api/users", userRoutes);

  // API lấy dữ liệu từ collection sites 
  const siteRoutes = require("./routes/site");
  app.use("/api/sites", siteRoutes);

  // khởi động server 
  app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
  });


