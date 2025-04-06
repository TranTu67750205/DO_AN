async function fetchData() {
    const response = await fetch("http://localhost:3000/api/sensors");
    const data = await response.json();
  
    const tableBody = document.getElementById("sensor-data");
    tableBody.innerHTML = "";
  
    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(item.timestamp).toLocaleString()}</td>
        <td>${item.id || "N/A"}</td>
        <td>${item.temperature.toFixed(2)}</td>
        <td>${item.humidity.toFixed(2)}</td>
        <td>${item.soil?.toFixed(2) ?? "N/A"}</td>
        <td>${item.uv?.toFixed(2) ?? "N/A"}</td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  setInterval(fetchData, 1000);
  fetchData(); // Gọi lần đầu khi tải trang