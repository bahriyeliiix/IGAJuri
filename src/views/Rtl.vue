<template>
  <div class="chart-container">
    <canvas ref="lineChart"></canvas>
  </div>
</template>

<script>
import { Chart } from "chart.js/auto";
import "chartjs-adapter-date-fns"; // Tarih adaptörünü ekliyoruz

export default {
  name: "LineChart",
  data() {
    return {
      chartData: {
        datasets: [
          {
            label: "Kalp Atış Hızı",
            backgroundColor: "#172540",
            borderColor: "#172540",
            borderWidth: 2,
            data: [], // Veriler burada olacak
            fill: false,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time", // Sürekli zaman ekseni
            time: {
              unit: "hour", // Saat bazında
              displayFormats: {
                hour: "HH:mm", // Zaman formatı
              },
            },
            ticks: {
              source: "auto",
              callback: function (value) {
                // Sadece sabit saatleri göster
                const fixedLabels = ["00:00", "06:00", "09:00", "12:00", "18:00", "23:59"];
                return fixedLabels.includes(value) ? value : null;
              },
              color: "white",
            },
            grid: {
              color: "white",
              borderDash: [5, 5],
            },
          },
          y: {
            beginAtZero: false,
            min: 0, // Minimum değer
            max: 200, // Maksimum değer
            position: "right",
            grid: {
              display: false,
            },
            ticks: {
              stepSize: 40, // 40'lık adımlar (0, 40, 80, 120, 160, 200)
              color: "white",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "white",
            },
          },
        },
      },
    };
  },
  mounted() {
    this.generateFakeData();
    this.createChart();
  },
  methods: {
    generateFakeData() {
      // Örnek veri (her 20 dakikada bir)
      const incomingData = [
        { time: "14:40", heartRate: 75 },
        { time: "15:00", heartRate: 82 },
        { time: "15:20", heartRate: 68 },
        { time: "15:40", heartRate: 90 },
        { time: "16:00", heartRate: 77 },
        { time: "16:20", heartRate: 85 },
        { time: "16:40", heartRate: 73 },
        { time: "17:00", heartRate: 88 },
        { time: "17:20", heartRate: 79 },
        { time: "17:40", heartRate: 94 },
        { time: "18:00", heartRate: 81 },
      ];

      // Veriyi chart.js formatına çevir
      this.chartData.datasets[0].data = incomingData.map((item) => ({
        x: `2025-03-03 ${item.time}`, // Tam tarih gerekiyor (örnek olarak bugünü kullandım)
        y: item.heartRate,
      }));
    },
    createChart() {
      const ctx = this.$refs.lineChart.getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: this.chartData,
        options: this.chartOptions,
      });
    },
  },
};
</script>

<style scoped>
.chart-container {
  width: 600px;
  height: 400px;
  background-color: #1a2b59;
  padding: 20px;
  border-radius: 10px;
}
</style>