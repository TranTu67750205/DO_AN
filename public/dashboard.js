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
          soil: [],
          uv: [],
        };
      }

    // Kiểm tra nếu timestamp đã tồn tại thì bỏ qua
    if (chartData[id].labels.includes(timeLabel)) return;

    chartData[id].labels.push(timeLabel);
    chartData[id].temperature.push(item.temperature);
    chartData[id].humidity.push(item.humidity);
    chartData[id].soil.push(item.soil);
    chartData[id].uv.push(item.uv);

     // Thêm dữ liệu mới (giới hạn 20 điểm)
     if (chartData[id].labels.length > 20) {
        chartData[id].labels.shift();
        chartData[id].temperature.shift();
        chartData[id].humidity.shift();
        chartData[id].soil.shift();
        chartData[id].uv.shift();
      }

    // Nếu biểu đồ chưa tồn tại, tạo mới
    if (!charts[id]) {
        createCharts(id);
      } else {
        updateCharts(id);
      }
    });
  }
  
  function createCharts(id) {
    const container = document.getElementById("charts");
  
    const row = document.createElement("div");
    row.className = "chart-row";
  
    // Chart 1: Temp & Hum
    const tempHumWrapper = document.createElement("div");
    tempHumWrapper.className = "chart-wrapper";
  
    const tempHumTitle = document.createElement("h3");
    tempHumTitle.innerText = `EndNode: ${id} | Temp & Hum`;
    const tempHumCanvas = document.createElement("canvas");
    tempHumCanvas.id = `chart-temp-hum-${id}`;
  
    tempHumWrapper.appendChild(tempHumTitle);
    tempHumWrapper.appendChild(tempHumCanvas);
    row.appendChild(tempHumWrapper);
  
    // Chart 2: Soil & UV
    const soilUvWrapper = document.createElement("div");
    soilUvWrapper.className = "chart-wrapper";
  
    const soilUvTitle = document.createElement("h3");
    soilUvTitle.innerText = `EndNode: ${id} | Soil & UV`;
    const soilUvCanvas = document.createElement("canvas");
    soilUvCanvas.id = `chart-soil-uv-${id}`;
  
    soilUvWrapper.appendChild(soilUvTitle);
    soilUvWrapper.appendChild(soilUvCanvas);
    row.appendChild(soilUvWrapper);
  
    container.appendChild(row);
  
    // Khởi tạo biểu đồ temp & hum
    const ctx1 = tempHumCanvas.getContext("2d");
    const chart1 = new Chart(ctx1, {
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
        scales: { y: { beginAtZero: true } },
      },
    });
  
    // Khởi tạo biểu đồ soil (line) & UV (bar)
    const ctx2 = soilUvCanvas.getContext("2d");
    const chart2 = new Chart(ctx2, {
        data: {
            labels: chartData[id].labels,
            datasets: [
              {
                type: "line",
                label: "Soil Moisture",
                data: chartData[id].soil,
                borderColor: "green",
                fill: false,
              },
              {
                type: "bar",
                label: "UV Index",
                data: chartData[id].uv,
                backgroundColor: "purple",
              },
            ],
          },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          "y-uv": {
            type: "linear",
            position: "left",
            beginAtZero: true,
            max: 12,
            title: {
              display: true,
              text: "UV Index",
            },
          },
          "y-soil": {
            type: "linear",
            position: "right",
            beginAtZero: true,
            max: 110,
            grid: {
              drawOnChartArea: false, // Không chồng grid hai trục
            },
            title: {
              display: true,
              text: "Soil Moisture",
            },
          },
        },
      },
    });
  
    charts[id] = {
      tempHumChart: chart1,
      soilUvChart: chart2,
    };
  }
  
  function updateCharts(id) {
    const data = chartData[id];
    const { tempHumChart, soilUvChart } = charts[id];
  
    tempHumChart.data.labels = data.labels;
    tempHumChart.data.datasets[0].data = data.temperature;
    tempHumChart.data.datasets[1].data = data.humidity;
    tempHumChart.update();
  
    soilUvChart.data.labels = data.labels;
    soilUvChart.data.datasets[0].data = data.soil;
    soilUvChart.data.datasets[1].data = data.uv;
    soilUvChart.update();
  }

setInterval(fetchData, 1000);
fetchData();