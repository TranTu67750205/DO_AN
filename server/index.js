  const express = require("express");
  const mqtt = require("mqtt");
  const cors = require("cors");
  const app = express();
  const port = 3000;
  
  const QRCode = require('qrcode');  

  const mongoose = require("mongoose");
  //import model ESPdata
  const ESPdata = require("./models/sensormodel");
  //import model verifySchema
  const IDVerification = require("./models/devicemodel");
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
  const MQTT_BROKER = "mqtt://192.168.1.2:1883"; // Địa chỉ Mosquitto, làm sao để kiểm tra địa chỉ của mosquitto?      .1.2    .1.139     .93.18 
  const DATA_TOPIC = "sensor/data"; // Topic ESP32 gửi dữ liệu
  const ID_TOPIC = "ID/data"; // Topic ESP32 gửi dữ liệu
  const mqttClient = mqtt.connect(MQTT_BROKER);

  // Khi kết nối thành công với MQTT Broker
  mqttClient.on("connect", () => {
      console.log("Đã kết nối với MQTT Broker");
      mqttClient.subscribe([DATA_TOPIC, ID_TOPIC], (err) => {
          if (!err) {
              console.log(`Đã subscribe các topic: ${DATA_TOPIC}, ${ID_TOPIC} `);
          }
      });
  });

  // Nhận dữ liệu từ ESP32 qua MQTT
  mqttClient.on("message", async (topic, message) => {
    console.log(`Nhận dữ liệu từ ${topic}: ${message.toString()}`);

    try {
      // Chuyển đổi JSON từ ESP32
        const data = JSON.parse(message.toString()); 

        // Cập nhật thời gian hoạt động của thiết bị
        /*
        const deviceId = data.id;
        Site.updateOne(
          { "devices.deviceId": deviceId },
          { $set: { "devices.$.lastActive": new Date() } }
        );*/ 

      if(topic === "sensor/data"){
        const deviceId = data.id;

        // Kiểm tra thiết bị đã xác minh chưa
        const verifiedDevice = await IDVerification.findOne({ id: deviceId, verified: true });
      
        if (!verifiedDevice) {
          console.warn(`❌ Thiết bị ${deviceId} chưa xác minh không lưu dữ liệu.`);
          return; // Ngắt ở đây, không tạo bản ghi
        }

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
      }
      else if (topic === "ID/data") {
        const existing = await IDVerification.findOne({ id: data.id });
        // Lưu gói tin xác minh ID
        if (!existing) {
          const newVerify = new IDVerification({
            type: data.type,
            id: data.id,
            timestamp: new Date(),
            raw: data // Lưu cả gói JSON nếu cần thêm trường sau này
          });
    
          await newVerify.save()
            .then(() => console.log("✅ Gói tin xác minh ID đã lưu vào MongoDB"))
            .catch(err => console.error("❌ Lỗi lưu ID:", err));
        }
        else {
          console.log("⚠️ ID đã tồn tại, không lưu trùng:", data.id);
        }
      }
    } 
    catch (error) {
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

  // API lấy dữ liệu từ collection IDVerify
  const verifyRoutes = require("./routes/device");
  app.use("/api", verifyRoutes);

  // khởi động server 
  app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
  });


