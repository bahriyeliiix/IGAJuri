<template>
  <div class="card mb-4">
    <div class="card-header pb-0">
      <div class="notification-header">
        <h6>
          <span class="emoji">📌</span>
          <span class="text">EN YOĞUN BİLDİRİM KONUMLARI</span>
          <span class="emoji">🔔</span>
        </h6>
      </div>
    </div>
    <br />
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table excel-table mb-0">
          <thead>
            <tr>
              <th class="excel-header">Sıra No</th>
              <th class="excel-header">Şehir</th>
              <th class="excel-header">İlçe</th>
              <th class="excel-header">Mahalle</th>
              <th class="excel-header">Bildirim Sayısı</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedData" :key="index">
              <td class="excel-cell">
                <span class="table-text" style="font-weight: bold;">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </span>
              </td>
              <td class="excel-cell">
                <span class="table-text" :style="getStyle(item.cityName)">
                  {{ formatValue(item.cityName) }}
                </span>
              </td>
              <td class="excel-cell">
                <span class="table-text" :style="getStyle(item.districtName)">
                  {{ formatValue(item.districtName) }}
                </span>
              </td>
              <td class="excel-cell">
                <span
                  class="table-text"
                  :style="getStyle(item.neighbourhoodName)"
                >
                  {{ formatValue(item.neighbourhoodName) }}
                </span>
              </td>
              <td class="excel-cell">
                <span
                  class="table-text"
                  :style="getStyle(item.notificationCount)"
                >
                  {{ formatValue(item.notificationCount) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination Kontrolleri -->
      <div
        class="pagination mt-3 d-flex justify-content-center align-items-center"
      >
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="btn btn-outline-custom mx-2"
        >
          Önceki
        </button>
        <div class="page-numbers mx-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: currentPage === page }]"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="btn btn-outline-custom mx-2"
        >
          Sonraki
        </button>
      </div>
      <div class="total-data text-right mt-2 mr-3">
          <span class="text-sm font-weight-bold"
            >Toplam Veri: {{ apiData.length }}</span
          >
        </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import store from "@/store";

export default {
  data() {
    return {
      apiData: [],
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.apiData.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.apiData.length / this.itemsPerPage);
    },
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const token = localStorage.getItem("authToken");
      if (token) {
        store.dispatch("saveToken", token);
      } else {
        this.$router.push("/signin");
      }
      try {
        const response = await axios.post(
          "https://localhost:7263/api/Dashboard/NeighbourhoodNotificationReport",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.statusCode === 200) {
          this.apiData = response.data.data;
        } else {
          console.error("API returned an error:", response.data.message);
        }
      } catch (error) {
        console.error("There was an error fetching the data:", error);
      }
    },
    formatValue(value) {
      return value === "Unknown" ? "Bilinmiyor" : value;
    },
    getStyle(value) {
      return value === "Unknown" ? { color: "red" } : {};
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
};
</script>

<style scoped>
.notification-header {
  text-align: center;
  padding: 20px;
  background-color: #20b5d6; /* #2ecd89 ile uyumlu açık yeşil */
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notification-header h6 {
  font-size: 1.5rem; /* 24px */
  font-weight: bold;
  color: #343a40; /* Koyu gri metin */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.emoji {
  font-size: 1.8rem; /* 28.8px */
}

.text {
  font-family: "Arial", sans-serif;
  color: #495057; /* Orta gri metin */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.pagination {
  padding: 10px;
}

.btn-outline-custom {
  color: #2ecd89; /* Tema yeşili */
  border-color: #2ecd89;
  background-color: transparent;
  font-size: 1rem; /* 16px */
  transition: all 0.3s ease;
}

.btn-outline-custom:hover {
  background-color: #2ecd89;
  color: #fff; /* Beyaz metin */
}

.btn-outline-custom:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #2ecd89; /* Tema yeşili kenarlık */
  background-color: #fff;
  color: #2ecd89; /* Tema yeşili metin */
  font-size: 1rem; /* 16px */
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover {
  background-color: #2ecd89;
  color: #fff; /* Beyaz metin */
}

.page-btn.active {
  background-color: #2ecd89;
  color: #fff;
  font-weight: bold;
}

.excel-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-header {
  background-color: #e6f4f0; /* #2ecd89 ile uyumlu açık yeşil */
  color: #2ecd89; /* Tema yeşili metin */
  font-size: 1rem; /* 20px */
  font-weight: 600;
  text-align: center;
  padding: 10px;
  border: 1px solid #2ecd89; /* Tema yeşili kenarlık */
  text-transform: uppercase;
}

.excel-cell {
  border: 1px solid #2ecd89; /* Tema yeşili kenarlık */
  padding: 10px;
  vertical-align: middle;
  text-align: center;
}

/* Tüm hücreler için temel kenarlıkları tekrardan tanımla */
.excel-table td {
  border-top: 1px solid #2ecd89;
  border-right: 1px solid #2ecd89;
  border-bottom: 1px solid #2ecd89;
  border-left: 1px solid #2ecd89;
}

/* Son satırdaki hücreler için kenarlıkları özellikle belirtiyoruz */
.excel-table tbody tr:last-child td {
  border-bottom: 1px solid #2ecd89; /* Alt kenarlık */
  border-right: 1px solid #2ecd89; /* Sağ kenarlık */
  border-left: 1px solid #2ecd89; /* Sol kenarlık */
}

/* Son sütunun sağ kenarlığını garantilemek için */
.excel-table td:last-child {
  border-right: 1px solid #2ecd89;
}

/* İlk sütunun sol kenarlığını garantilemek için */
.excel-table td:first-child {
  border-left: 1px solid #2ecd89;
}

.table-text {
  font-size: 0.7rem; /* 15px */
  font-weight: 500;
  color: #343a40; /* Koyu gri metin */
  display: block;
  text-align: center;
}
.total-data {
  font-size: 0.9rem;
  color: #2ecd89;
  padding: 5px;
}

/* Responsive ayar (isteğe bağlı) */
@media (max-width: 768px) {
  .total-data {
    text-align: center;
    margin-right: 0;
  }
}
</style>
