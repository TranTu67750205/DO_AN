const API_URL = "http://localhost:3000";

function showAddForm() {
  document.getElementById("site-name").value = "";
  document.getElementById("creator-name").value = "";
  document.getElementById("device-list-inputs").innerHTML = "";
  addDeviceInput();
}

function cancelForm() {
  document.getElementById("site-name").value = "";
  document.getElementById("creator-name").value = "";
  document.getElementById("device-list-inputs").innerHTML = "";
}

function addDeviceInput(value = "") {
  const container = document.getElementById("device-list-inputs");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "device-input";
  input.value = value;
  container.appendChild(input);
}

async function submitSite() {
  const name = document.getElementById("site-name").value;
  const createdBy = document.getElementById("creator-name").value;
  const deviceInputs = document.querySelectorAll(".device-input");
  const devices = Array.from(deviceInputs)
    .map((input) => ({ deviceId: input.value }))
    .filter((d) => d.deviceId);

  try {
    const res = await fetch("http://localhost:3000/api/sites/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locationName, createdAt, createdBy, devices }),
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
  try {
    const res = await fetch("http://localhost:3000/api/sites");
    const sites = await res.json();

    const tbody = document.getElementById("site-table-body");
    tbody.innerHTML = "";

    sites.forEach((site) => {
      const row = document.createElement("tr");
      const deviceList = site.devices.map((d) => d.deviceId).join(", ");

      row.innerHTML = `
        <td>${site.locationName}</td>
        <td>${new Date(site.createdAt).toLocaleString()}</td>
        <td>${site.createdBy}</td>
        <td>${deviceList}</td>
      `;

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách site:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadSiteList);