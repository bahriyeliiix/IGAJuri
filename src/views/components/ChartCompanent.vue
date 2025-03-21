<template>
  <div class="chart-container">
    <h2>{{ chartTitle }}</h2>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

export default {
  name: 'ChartComponent',
  props: {
  chartTitle: {
    type: String,
    required: true,
  },
  labels: {
    type: Array,
    required: true,
  },
  values: {
    type: Array,
    required: true,
  },
},
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      // Chart.js'i register et
      Chart.register(...registerables);

      // Canvas elementini al
      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Chart'ı oluştur
      new Chart(ctx, {
  type: 'bar', // Dinamik grafik tipi
  data: {
    labels: this.labels,
    datasets: [
      {
        label: this.chartTitle,
        data: this.values,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
        },
        options: {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        tooltipFormat: 'DD MMM YYYY',
      },
      title: {
        display: true,
        text: 'Tarih',
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Değer',
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${context.raw}`,
      },
    },
  },
},


      });
    },
  },
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 200px; /* Yüksekliği artır */
  margin-bottom: 20px;
}

canvas {
  width: 100% !important; /* Canvas genişliği */
  height: 100% !important; /* Canvas yüksekliği */
}
</style>