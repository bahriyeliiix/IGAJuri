<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
import Carousel from "./components/Carousel.vue";
import { Chart } from "chart.js";

const store = useStore();

// Veriler için ref'ler
const totalUsers = ref({ value: "0", changed: "0", isPositive: false });
const lastDay = ref({ value: "0", changed: "0", isPositive: false });
const lastHour = ref({ value: "0", changed: "0", isPositive: false });
const lastFiveMinutes = ref({ value: "0", changed: "0", isPositive: false });
const sales = ref([]);

// Grafik verileri için ref
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Gelen Bildirim",
      data: [],
      borderColor: "rgba(255, 152, 0, 0.2)", // Yeşil renk
      backgroundColor: "#4CAF50", // Turuncu renk, %20 opaklık
      fill: true,
    },
  ],
});

let myChart = null; // Chart nesnesini saklamak için

// API'den veri çekme fonksiyonu
const fetchData = async () => {
  // const token = store.state.token;
  const token = localStorage.getItem("authToken");
  if (token) {
    store.dispatch("saveToken", token);
  } else {
    this.$router.push("/signin");
  }
  try {
    // Toplam kullanıcı verisi
    const totalUsersResponse = await axios.post(
      "https://scorezone.igairport.aero:7263/api/Dashboard/GetTotal",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    totalUsers.value = totalUsersResponse.data.data;

    // Son 1 gün verisi
    const lastDayResponse = await axios.post(
      "https://scorezone.igairport.aero:7263/api/Dashboard/GetLastDay",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    lastDay.value = lastDayResponse.data.data;

    // Son 1 saat verisi
    const lastHourResponse = await axios.post(
      "https://scorezone.igairport.aero:7263/api/Dashboard/GetLastHour",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    lastHour.value = lastHourResponse.data.data;

    // Son 5 dakika verisi
    const lastFiveMinutesResponse = await axios.post(
      "https://scorezone.igairport.aero:7263/api/Dashboard/GetLastFiveMinute",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    lastFiveMinutes.value = lastFiveMinutesResponse.data.data;

    // Şehir bazlı kullanıcı verisi
    const getMostCities = await axios.post(
      "https://scorezone.igairport.aero:7263/api/Dashboard/GetMostCities",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    sales.value = getMostCities.data.data;

    // Grafik verisi
    const chartResponse1 = await axios.post(
      "https://scorezone.igairport.aero:7263/api/Dashboard/GetTotalActiveUserLastYear",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const chartResponse2 = await axios.post(
      "https://scorezone.igairport.aero:7263/api/Dashboard/GetTotalActiveUserCountLastYear",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (chartResponse1.data.statusCode === 200) {
      const labels = [];
      const data1 = []; // İlk dataset için veriler
      const data2 = []; // İkinci dataset için veriler

      // Tüm ayları ve günlerini işle
      Object.keys(chartResponse1.data.data).forEach((month) => {
        Object.keys(chartResponse1.data.data[month]).forEach((day) => {
          labels.push(`${day} ${month}`); // Gün ve ayı birleştirerek label oluştur
          data1.push(chartResponse1.data.data[month][day]); // İlk dataset için veri
        });
      });

      Object.keys(chartResponse2.data.data).forEach((month) => {
        Object.keys(chartResponse2.data.data[month]).forEach((day) => {
          labels.push(`${day} ${month}`); // Gün ve ayı birleştirerek label oluştur
          data2.push(chartResponse2.data.data[month][day]); // İlk dataset için veri
        });
      });

      // Chart verilerini güncelle
      chartData.value.labels = labels;
      // chartData.value.datasets[0].data = data;
      chartData.value.datasets = [
        {
          label: "Bildirim Adedi", // İlk dataset etiketi
          data: data1, // İlk dataset verileri
          borderColor: "rgba(75, 192, 192, 1)", // İlk dataset rengi
          backgroundColor: "rgba(75, 192, 192, 0.2)", // Dolgu rengi
          borderWidth: 2,
        },
        {
          label: "Bildirim Gönderen Kullanıcı Sayısı", // İkinci dataset etiketi
          data: data2, // İkinci dataset verileri
          borderColor: "rgba(255, 99, 132, 1)", // İkinci dataset rengi
          backgroundColor: "rgba(255, 99, 132, 0.2)", // Dolgu rengi
          borderWidth: 2,
        },
      ];

      // Önceki grafiği temizle
      if (myChart) {
        myChart.destroy();
      }
      // Yeni grafik oluştur
      myChart = new Chart(document.getElementById("myChart"), {
        type: "line",
        data: chartData.value,
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: (ctx) =>
                "Point Style: " + ctx.chart.data.datasets[0].pointStyle,
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("API çağrısı sırasında hata oluştu:", error);
  }
};

// Açıklama metni oluşturma fonksiyonu
const getDescription = (data) => {
  const changeClass = data.isPositive ? "text-success" : "text-danger";
  const changeSymbol = data.isPositive ? "+" : "-";
  return `<span class='text-sm font-weight-bolder ${changeClass}'>${changeSymbol}${data.changed}</span> değişim`;
};

// Sayfa yüklendiğinde verileri çek
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-lg-12">
        <!-- İstatistik Kartları -->
        <div class="row">
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Toplam Kullanıcı"
              :value="totalUsers.value"
              :description="getDescription(totalUsers)"
              :icon="{
                component: 'fa fa-users',
                background: 'bg-gradient-primary',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Son 1 gün"
              :value="lastDay.value"
              :description="getDescription(lastDay)"
              :icon="{
                component: 'fa fa-calendar',
                background: 'bg-gradient-danger',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Son 1 saat"
              :value="lastHour.value"
              :description="getDescription(lastHour)"
              :icon="{
                component: 'fa fa-clock',
                background: 'bg-gradient-success',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Son 5 dakika"
              :value="lastFiveMinutes.value"
              :description="getDescription(lastFiveMinutes)"
              :icon="{
                component: 'fa fa-map-marker',
                background: 'bg-gradient-warning',
                shape: 'rounded-circle',
              }"
            />
          </div>
        </div>

        <!-- Grafik -->
        <div class="row">
          <div class="col-lg-12 mb-lg">
            <div class="card z-index-2">
              <canvas id="myChart" width="400" height="100"></canvas>
            </div>
          </div>
        </div>

        <!-- Şehir Bazlı Kullanıcılar Tablosu -->
        <div class="row mt-4">
          <div class="col-lg-7 mb-lg-0 mb-4">
            <div class="card">
              <div class="p-3 pb-0 card-header">
                <div class="d-flex justify-content-between">
                  <h6 class="mb-2">İl Bazında Kullanıcılar</h6>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table align-items-center">
                  <tbody>
                    <tr v-for="(sale, index) in sales" :key="index">
                      <td class="w-30">
                        <div class="px-2 py-1 d-flex align-items-center">
                          <div>
                            <img :src="sale.logoIcon" alt="Country flag" />
                          </div>
                          <div class="ms-4">
                            <p class="mb-0 text-xs font-weight-bold">
                              {{ sale.country }}
                            </p>
                            <h6 class="mb-0 text-sm">{{ sale.city }}</h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-center">
                          <p class="mb-0 text-xs font-weight-bold">
                            Toplam Kullanıcı:
                          </p>
                          <h6 class="mb-0 text-sm">{{ sale.total }}</h6>
                        </div>
                      </td>
                      <td>
                        <div class="text-center">
                          <p class="mb-0 text-xs font-weight-bold">
                            Son 24 Saat:
                          </p>
                          <h6 class="mb-0 text-sm">{{ sale.last24hours }}</h6>
                        </div>
                      </td>
                      <td class="text-sm align-middle">
                        <div class="text-center col">
                          <p class="mb-0 text-xs font-weight-bold">
                            3 Günden Fazla Veri Alınamayan :
                          </p>
                          <h6 class="mb-0 text-sm">%{{ sale.bounce }}</h6>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Carousel -->
          <div class="col-lg-5">
            <carousel />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* İsteğe bağlı stil eklemeleri */
</style>
