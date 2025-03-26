async function fetchData() {
    const response = await fetch("/api/data");
    const data = await response.json();
  
    const tableBody = document.getElementById("sensor-data");
    tableBody.innerHTML = "";
  
    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(item.timestamp).toLocaleString()}</td>
        <td>${item.temperature.toFixed(2)}</td>
        <td>${item.humidity.toFixed(2)}</td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  setInterval(fetchData, 1000);