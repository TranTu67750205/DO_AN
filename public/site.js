const API_URL = "http://localhost:3000";
const selectedDevices = new Set(); // Để tránh trùng ID

function showAddForm() {
  document.getElementById("site-name").value = "";
  document.getElementById("creator-name").value = "";
  document.getElementById("device-list-inputs").innerHTML = "";
  document.getElementById("selected-devices").innerHTML = "";
  addDeviceInput();
}

function cancelForm() {
  document.getElementById("site-name").value = "";
  document.getElementById("creator-name").value = "";
  document.getElementById("device-list-inputs").innerHTML = "";
}

async function addDeviceInput() {
  const container = document.getElementById("device-list-inputs");
  container.innerHTML = "";
  try {
    const res = await fetch("http://localhost:3000/api/sites/devices_verified", {
      method: "GET"
    });
    const devices = await res.json();

    devices.forEach(device => {
      const input = document.createElement("div");
      //input.type = "text";
      input.className = "device-card background bounce-button";
      //input.value = value;
    
      const idText = document.createElement("p");
      idText.textContent = `ID: ${device.id}`;
    
      const adddevices = document.createElement("button");
      adddevices.textContent = "thêm thiết bị";
      adddevices.onclick = () => addDevices(device.id);
      
      input.appendChild(idText);
      input.appendChild(adddevices);
      container.appendChild(input);
    });
  }
  catch (error) {
  console.error("Lỗi tạo site:", error);
  }
}

async function addDevices(id) {
  try {
    if (selectedDevices.has(id)) return;

    selectedDevices.add(id);
  
    const container = document.getElementById("selected-devices");
    const tag = document.createElement("div");
    tag.className = "selected-device bounce-button";
    tag.textContent = id;
  
    // Xử lý click để xóa thiết bị khỏi danh sách đã chọn
    tag.onclick = () => {
      selectedDevices.delete(id);
      container.removeChild(tag);
    };
  
    container.appendChild(tag);
  }
  catch (error) {
    console.error("Lỗi add device :", error);
  }
}

async function submitSite() {
  const locationName = document.getElementById("site-name").value;
  const createdBy = document.getElementById("creator-name").value;
  const devices = Array.from(selectedDevices);;

  try {
    const res = await fetch("http://localhost:3000/api/sites/add", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ locationName, createdBy, devices }),
    });

    const data = await res.json();
    alert(data.message || data.error);
    loadSiteList();
    cancelForm();
  } catch (error) {
    console.error("Lỗi tạo site:", error);
  }
}

async function loadSiteList() {  
  const res = await fetch("http://localhost:3000/api/sites/load");
  const sites = await res.json();

  const tbody = document.getElementById("site-table");
  document.getElementById("selected-devices").innerHTML = "";
  tbody.innerHTML = "";

  
  for (const site of sites) {
    const deviceIds = site.devices;

    let statusMap = {};
    try {
      const statusRes = await fetch("http://localhost:3000/api/sites/status-devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceIds }),
      });

      const statuses = await statusRes.json(); // [{ deviceId, status }]
      statuses.forEach(({ deviceId, status }) => statusMap[deviceId] = status);

    } catch (err) {
      console.error(`Lỗi khi tải trạng thái của site ${site.locationName}:`, err);
    }

    site.devices.forEach((deviceID, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      ${index === 0 ? `<td rowspan="${site.devices.length}">${new Date(site.createdAt).toLocaleString()}</td>` : ""}
      ${index === 0 ? `<td rowspan="${site.devices.length}">${site.locationName}</td>` : ""}
      ${index === 0 ? `<td rowspan="${site.devices.length}">${site.createdBy}</td>` : ""}
      <td>${deviceID}</td>
      <td>${statusMap[deviceID] || "🔴 Offline"}</td>
    `;

    tbody.appendChild(row);
    });
  }

}

setInterval(fetchData, 1000);
fetchData(); // Gọi lần đầu khi tải trang