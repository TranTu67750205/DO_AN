document.addEventListener("DOMContentLoaded", () => {
    loadDevices();
});

async function loadDevices() {
    await loadUnverifiedDevices();
    await loadVerifiedDevices();
}

async function loadUnverifiedDevices() {
    const container = document.getElementById("unverifiedDevices");

    try {
        const res = await fetch("http://localhost:3000/api/unverified-devices");
        const devices = await res.json();

        devices.forEach(device => {
            const card = document.createElement("div");
            card.className = "device-card unverified";  // device-card unverified

            const idText = document.createElement("p");
            idText.textContent = `ID: ${device.id}`;

            const qrDiv = document.createElement("div");
            qrDiv.id = `qr-${device.id}`;

            //res.json(qrDiv);

            card.appendChild(idText);
            card.appendChild(qrDiv);
            container.appendChild(card);

            // Tạo mã QR chứa type và id
            const serverIP = "192.168.1.139"; // Thay bằng IP nội bộ thật của máy bạn

            new QRCode(qrDiv, {
                text: `http://${serverIP}:3000/api/verified-devices?id=${device.id}`,
                width: 100,
                height: 100
            });
        });
    } catch (err) {
        console.error("❌ Lỗi khi tải thiết bị chưa xác minh:", err);
    }
}

async function loadVerifiedDevices() {
    const container = document.getElementById("verifiedDevices");
    container.innerHTML = ""; // Clear cũ
    try {
        const res = await fetch("http://localhost:3000/api/verified");
        const devices = await res.json();
        //const resQR = await loadUnverifiedDevices();
        //const QR = await resQR.json();

        devices.forEach(device => {
            const card = document.createElement("div");
            card.className = "device-card verified";

            const idText = document.createElement("p");
            idText.textContent = `ID: ${device.id}`;

            const deletedevices = document.createElement("button");
            deletedevices.textContent = "❌ Xóa thiết bị";
            deletedevices.onclick = () => deleteDevices(device.id);

            //card.appendChild(QR);
            card.appendChild(idText);
            card.appendChild(deletedevices);
            container.appendChild(card);
        });
    } catch (err) {
        console.error("❌ Lỗi khi tải thiết bị đã xác minh:", err);
    }
}

async function deleteDevices(id) {
    try {
        const res = await fetch(`http://localhost:3000/api/deleteDevices?id=${id}`,{
            method: "DELETE",
        });
        if (res.ok) {
            alert("✅ Đã xóa thiết bị!");
            loadVerifiedDevices(); // Reload lại danh sách
        } else {
            alert("❌ Xóa thất bại!");
        }
    }
    catch (err) {
        console.error("❌ Lỗi khi xóa thiết bị:", err);
    }
}