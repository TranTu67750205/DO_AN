const charts = {}; // Lưu các biểu đồ theo ID
const chartData = {}; // Lưu dữ liệu theo ID

async function fetchData() {
  const response = await fetch("http://localhost:3000/api/sensors?since=lastTimestamp");
  const data = await response.json();

  data.forEach((item) => {
    const id = item.id;
    if (!id) return;

    const timeLabel = new Date(item.timestamp).toLocaleTimeString();

    // Nếu chưa có dữ liệu ID này thì khởi tạo
    if (!chartData[id]) {
      chartData[id] = {
        labels: [],
        temperature: [],
        humidity: [],
      };
    }

    // Kiểm tra nếu timestamp đã tồn tại thì bỏ qua
    if (chartData[id].labels.includes(timeLabel)) return;

    chartData[id].labels.push(timeLabel);
    chartData[id].temperature.push(item.temperature);
    chartData[id].humidity.push(item.humidity);

     // Thêm dữ liệu mới (giới hạn 20 điểm)
    if (chartData[id].labels.length > 20) {
      chartData[id].labels.shift();
      chartData[id].temperature.shift();
      chartData[id].humidity.shift();
    }

    // Nếu biểu đồ chưa tồn tại, tạo mới
    if (!charts[id]) {
      createChart(id);
    } else {
      // Cập nhật dữ liệu
      const chart = charts[id];
      chart.data.labels = chartData[id].labels;
      chart.data.datasets[0].data = chartData[id].temperature;
      chart.data.datasets[1].data = chartData[id].humidity;
      chart.update();
    }
  });
}

// Tạo biểu đồ mới theo ID
function createChart(id) {
  const container = document.getElementById("charts");

  // Tạo wrapper để giữ layout 2 biểu đồ/1 hàng
  const chartWrapper = document.createElement("div");
  chartWrapper.className = "chart-wrapper";

  const title = document.createElement("h3");
  title.innerText = `EndNode ID: ${id}`;

  const canvas = document.createElement("canvas");
  canvas.id = `chart-${id}`;

  chartWrapper.appendChild(title);
  chartWrapper.appendChild(canvas);
  container.appendChild(chartWrapper);

  const ctx = canvas.getContext("2d");

  charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData[id].labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: chartData[id].temperature,
          borderColor: "red",
          fill: false,
        },
        {
          label: "Humidity (%)",
          data: chartData[id].humidity,
          borderColor: "blue",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

setInterval(fetchData, 1000);
fetchData();