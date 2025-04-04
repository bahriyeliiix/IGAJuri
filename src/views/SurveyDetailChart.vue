<template>
  <div class="dashboard-container">
    <div class="header-wrapper">
      <div class="title-container">
        <h1 class="title" style="font-size: 1.2rem">📊 Anket Analiz Paneli</h1>
        <button
          @click="fetchSurveyContent"
          class="export-button"
          :disabled="isExporting"
        >
          {{ isExporting ? "Dışa Aktarılıyor..." : "Excel'e Aktar" }}
        </button>
      </div>
      <div class="dropdown-container">
        <label for="chartSelect" style="font-size: 0.9rem">Grafik Seçin:</label>
        <select
          id="chartSelect"
          v-model="selectedChart"
          class="chart-dropdown"
          style="font-size: 0.9rem"
          @change="onChartChange"
        >
          <option value="voteTotals">Fotoğrafların Toplam Oyları</option>
          <option value="voteCounts">Fotoğraflara Kullanılan Oy Sayısı</option>
          <option value="commentCounts">Fotoğraflara Gelen Yorum Sayısı</option>
          <option value="surveyHighlights">Anket İstatistikleri</option>
        </select>
      </div>
    </div>

    <!-- Mesaj Alanı -->
    <div
      v-if="exportMessage"
      class="message"
      :class="{ success: !exportError, error: exportError }"
    >
      {{ exportMessage }}
    </div>

    <div class="content-wrapper">
      <div v-if="loading" class="loading">Yükleniyor...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="chart-wrapper">
        <div
          class="chart-card"
          v-if="selectedChart === 'voteTotals' && voteTotals.length"
        >
          <h5>Fotoğrafların Toplam Oyları</h5>
          <p class="description">
            Her fotoğrafın aldığı toplam oy sayısını gösterir.
          </p>
          <BarChart
            :data="voteTotalsData"
            :options="chartOptions"
            ref="voteTotalsChart"
          />
        </div>

        <div
          class="chart-card"
          v-else-if="selectedChart === 'voteCounts' && voteCounts.length"
        >
          <h5>Fotoğraflara Kullanılan Oy Sayısı</h5>
          <p class="description">
            Her fotoğraf için kullanılan oy sayısını gösterir.
          </p>
          <BarChart
            :data="voteCountsData"
            :options="chartOptions"
            ref="voteCountsChart"
          />
        </div>

        <div
          class="chart-card"
          v-else-if="selectedChart === 'commentCounts' && commentCounts.length"
        >
          <h5>Fotoğraflara Gelen Yorum Sayısı</h5>
          <p class="description">
            Her fotoğrafa yapılan yorum sayısını gösterir.
          </p>
          <BarChart
            :data="commentCountsData"
            :options="chartOptions"
            ref="commentCountsChart"
          />
        </div>

        <div v-else-if="selectedChart !== 'surveyHighlights'" class="no-data">
          Seçilen grafik için veri bulunamadı.
        </div>
      </div>
    </div>

    <div
      class="highlights-container"
      v-if="selectedChart === 'surveyHighlights' && surveyHighlights"
    >
      <div class="highlights-header">
        <h2>{{ surveyHighlights.surveyTitle }}</h2>
        <p class="survey-id">Anket ID: {{ surveyHighlights.surveyId }}</p>
      </div>

      <div class="stats-grid">
        <!-- Top 5 by Total Votes -->
        <div class="stat-card top-card">
          <h3>🏆 En Çok Oylananlar</h3>
          <div class="photo-list">
            <div
              v-for="(photo, index) in surveyHighlights.top5ByTotalVotes"
              :key="'total-' + photo.photoId"
              class="photo-item"
            >
              <span class="rank">{{ index + 1 }}.</span>
              <span
                class="photo-title"
                @click="openImageModal(photo.photoPath, photo.photoTitle)"
                style="cursor: pointer"
              >
                {{ photo.photoTitle }}
              </span>
              <span class="photo-stat">{{ photo.totalVotes }} oy</span>
            </div>
          </div>
        </div>

        <!-- Top 5 by Vote Count -->
        <div class="stat-card top-card">
          <h3>⭐ En Çok Oylama Yapılanlar</h3>
          <div class="photo-list">
            <div
              v-for="(photo, index) in surveyHighlights.top5ByVoteCount"
              :key="'count-' + photo.photoId"
              class="photo-item"
            >
              <span class="rank">{{ index + 1 }}.</span>
              <span
                class="photo-title"
                @click="openImageModal(photo.photoPath, photo.photoTitle)"
                style="cursor: pointer"
              >
                {{ photo.photoTitle }}
              </span>
              <span class="photo-stat">{{ photo.voteCount }} oylama</span>
            </div>
          </div>
        </div>

        <!-- Top 5 by Comments -->
        <div class="stat-card top-card">
          <h3>💬 En Çok Yorum Alanlar</h3>
          <div class="photo-list">
            <div
              v-for="(photo, index) in surveyHighlights.top5ByComments"
              :key="'comment-' + photo.photoId"
              class="photo-item"
            >
              <span class="rank">{{ index + 1 }}.</span>
              <span
                class="photo-title"
                @click="openImageModal(photo.photoPath, photo.photoTitle)"
                style="cursor: pointer"
              >
                {{ photo.photoTitle }}
              </span>
              <span class="photo-stat">{{ photo.commentCount }} yorum</span>
            </div>
          </div>
        </div>

        <!-- Bottom 5 by Total Votes -->
        <div class="stat-card bottom-card">
          <h3>😞 En Az Oylananlar</h3>
          <div class="photo-list">
            <div
              v-for="(photo, index) in surveyHighlights.bottom5ByTotalVotes"
              :key="'bottom-' + photo.photoId"
              class="photo-item"
            >
              <span class="rank">{{ index + 1 }}.</span>
              <span
                class="photo-title"
                @click="openImageModal(photo.photoPath, photo.photoTitle)"
                style="cursor: pointer"
              >
                {{ photo.photoTitle }}
              </span>
              <span class="photo-stat">{{ photo.totalVotes }} oy</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for Image Display -->
      <div v-if="showModal" class="modal-overlay" @click="closeImageModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close-btn" @click="closeImageModal">✖</button>
          <p>{{ selectedImageTitle }}</p>
          <img
            :src="selectedImageUrl"
            alt="Selected Photo"
            class="modal-image"
          />
        </div>
      </div>
    </div>

    <div v-else-if="selectedChart === 'surveyHighlights'" class="no-data">
      Anket istatistikleri bulunamadı.
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar as BarChart } from "vue-chartjs";
import axios from "axios";
import * as XLSX from "xlsx"; // Excel export için

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default defineComponent({
  name: "SurveyAnalyticsDashboard",
  components: {
    BarChart,
  },
  setup() {
    const voteTotalsChart = ref(null);
    const voteCountsChart = ref(null);
    const commentCountsChart = ref(null);

    return {
      voteTotalsChart,
      voteCountsChart,
      commentCountsChart,
    };
  },
  data() {
    return {
      surveyId: null,
      error: null,
      loading: false,
      selectedChart: "voteTotals",
      voteTotals: [],
      voteCounts: [],
      commentCounts: [],
      surveyHighlights: null,
      showModal: false,
      selectedImageTitle: "",
      selectedImageUrl: "",
      isExporting: false, // Excel export durumu
      exportMessage: "", // Export mesajı
      exportError: false, // Export hata durumu
      surveyContent: [], // Export edilecek veri

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { font: { size: 14 } } },
          tooltip: { mode: "index", intersect: false },
        },
      },
    };
  },
  computed: {
    voteTotalsData() {
      return {
        labels: this.voteTotals.map(
          (item) => item.photoTitle || "Bilinmeyen Fotoğraf"
        ),
        datasets: [
          {
            label: "Toplam Oylar",
            data: this.voteTotals.map((item) => item.totalVotes || 0),
            backgroundColor: "#36A2EB",
            borderColor: "#2c8cd6",
            borderWidth: 1,
          },
        ],
      };
    },
    voteCountsData() {
      return {
        labels: this.voteCounts.map(
          (item) => item.photoTitle || "Bilinmeyen Fotoğraf"
        ),
        datasets: [
          {
            label: "Oy Sayısı",
            data: this.voteCounts.map((item) => item.voteCount || 0),
            backgroundColor: "#FF6384",
            borderColor: "#e55771",
            borderWidth: 1,
          },
        ],
      };
    },
    commentCountsData() {
      return {
        labels: this.commentCounts.map(
          (item) => item.photoTitle || "Bilinmeyen Fotoğraf"
        ),
        datasets: [
          {
            label: "Yorum Sayısı",
            data: this.commentCounts.map((item) => item.commentCount || 0),
            backgroundColor: "#FFCE56",
            borderColor: "#e5b84d",
            borderWidth: 1,
          },
        ],
      };
    },
  },
  created() {
    this.surveyId = this.$route.params.id;
    this.fetchSelectedChartData();
  },
  watch: {
    selectedChart() {
      this.fetchSelectedChartData();
    },
    voteTotalsData() {
      if (this.voteTotalsChart && this.voteTotalsChart.value) {
        this.voteTotalsChart.value.update();
      }
    },
    voteCountsData() {
      if (this.voteCountsChart && this.voteCountsChart.value) {
        this.voteCountsChart.value.update();
      }
    },
    commentCountsData() {
      if (this.commentCountsChart && this.commentCountsChart.value) {
        this.commentCountsChart.value.update();
      }
    },
  },
  methods: {
    onChartChange() {
      if (this.selectedChart === "surveyHighlights") {
        this.fetchSurveyHighlights();
      } else {
        this.fetchSelectedChartData();
      }
    },
    async fetchSurveyHighlights() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const response = await axios.get(
          `https://localhost:7263/api/Survey/highlights/${this.surveyId}`,
          { headers }
        );

        this.surveyHighlights = response.data.data;

        if (!this.surveyHighlights) {
          this.error = "Anket istatistikleri bulunamadı.";
        }
      } catch (error) {
        console.error("Anket istatistikleri yüklenirken hata:", error);
        this.error =
          "Anket istatistikleri yüklenemedi. Lütfen daha sonra tekrar deneyin.";
      } finally {
        this.loading = false;
      }
    },
    async fetchSelectedChartData() {
      this.loading = true;
      this.error = null;

      try {
        switch (this.selectedChart) {
          case "voteTotals":
            await this.fetchVoteTotals();
            break;
          case "voteCounts":
            await this.fetchVoteCounts();
            break;
          case "commentCounts":
            await this.fetchCommentCounts();
            break;
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        this.error = "Veriler yüklenemedi. Lütfen daha sonra tekrar deneyin.";
      } finally {
        this.loading = false;
        await this.$nextTick();
      }
    },
    async fetchVoteTotals() {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const response = await axios.get(
        `https://localhost:7263/api/Survey/vote-totals/${this.surveyId}`,
        { headers }
      );
      this.voteTotals = response.data.data || [];
      if (!this.voteTotals.length)
        this.error = "Bu grafik için veri bulunamadı.";
    },
    async fetchVoteCounts() {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const response = await axios.get(
        `https://localhost:7263/api/Survey/vote-counts/${this.surveyId}`,
        { headers }
      );
      this.voteCounts = response.data.data || [];
      if (!this.voteCounts.length)
        this.error = "Bu grafik için veri bulunamadı.";
    },
    async fetchCommentCounts() {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const response = await axios.get(
        `https://localhost:7263/api/Survey/comment-counts/${this.surveyId}`,
        { headers }
      );
      this.commentCounts = response.data.data || [];
      if (!this.commentCounts.length)
        this.error = "Bu grafik için veri bulunamadı.";
    },
    openImageModal(photoPath, photoTitle) {
      this.selectedImageUrl = `https://localhost:7263/img/${photoPath}`;
      this.selectedImageTitle = photoTitle;
      this.showModal = true;
    },
    closeImageModal() {
      this.showModal = false;
      this.selectedImageUrl = "";
      this.selectedImageTitle = "";
    },
    async fetchSurveyContent() {
      this.isExporting = true;
      this.exportMessage = "";
      this.exportError = false;

      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const response = await axios.get(
          `https://localhost:7263/api/Survey/GetSurveyContent/${this.surveyId}`,
          { headers }
        );
        this.surveyContent = response.data.data; // Gelen liste burada

        this.exportToExcel();
        this.exportMessage = "Veriler Excel'e başarıyla aktarıldı! 🎉";
      } catch (error) {
        this.exportError = true;
        this.exportMessage = "Oops! Bir şeyler ters gitti, tekrar dene! 😅";
        console.error(error);
      } finally {
        this.isExporting = false;
      }
    },
    exportToExcel() {
      // Veriyi kullanıcı dostu bir formata çevir ve sıra numarası ekle
      const formattedData = this.surveyContent.map((item, index) => ({
        "Sıra No": index + 1, // Sıra numarası (1'den başlar)
        "Anket Adı": item.surveyName,
        "Fotoğraf ID": item.photoId,
        "Fotoğraf Başlığı": item.photoTitle,
        "Fotoğraf Yolu": item.photoPath,
        "Oy Veren Kullanıcı Sayısı": item.voteUserCount,
        "Yorum Yapan Kullanıcı Sayısı": item.commentUserCount,
        "Toplam Oy Sayısı": item.voteCount,
      }));

      // Worksheet oluştur
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // Stil tanımlamaları
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } }, // Beyaz yazı
        fill: { patternType: "solid", fgColor: { rgb: "4CAF50" } }, // Yeşil arka plan
        alignment: { horizontal: "center", vertical: "center" },
      };

      const cellStyle = {
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // Başlıklara stil uygulama
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[cellAddress]) {
          ws[cellAddress].s = headerStyle;
        }
      }

      // Diğer hücrelere stil uygulama
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (ws[cellAddress]) {
            ws[cellAddress].s = cellStyle;
          }
        }
      }

      // Sütun genişlikleri (Sıra No için ekstra genişlik eklendi)
      ws["!cols"] = [
        { wch: 10 }, // Sıra No
        { wch: 20 }, // Anket Adı
        { wch: 15 }, // Fotoğraf ID
        { wch: 25 }, // Fotoğraf Başlığı
        { wch: 30 }, // Fotoğraf Yolu
        { wch: 20 }, // Oy Veren Kullanıcı Sayısı
        { wch: 20 }, // Yorum Yapan Kullanıcı Sayısı
        { wch: 15 }, // Toplam Oy Sayısı
      ];
      const surveyName =
        this.surveyContent[0]?.surveyName || "Bilinmeyen_Anket"; // İlk elemanın surveyName'i, yoksa varsayılan

      // Workbook oluştur ve dosyayı indir
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Anket Verileri");
      XLSX.writeFile(wb, `${surveyName}_Raporu.xlsx`);
    },
  },
});
</script>

<style scoped>
.dashboard-container {
  padding: 30px;
  max-width: 1600px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title {
  color: #2c3e50;
  font-size: 1.2rem;
  margin: 0;
}

.export-button {
  background-color: #4caf50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-button:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.export-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.dropdown-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-container label {
  font-size: 0.9rem;
  color: #34495e;
}

.chart-dropdown {
  padding: 8px 12px;
  font-size: 0.9rem;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  background: #fff;
  color: #34495e;
  cursor: pointer;
  min-width: 250px;
}

.message {
  text-align: center;
  padding: 10px;
  font-size: 0.9rem;
}

.success {
  color: #28a745;
  font-weight: bold;
}

.error {
  color: #dc3545;
  font-weight: bold;
}

/* Mevcut stillerin geri kalanı */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.loading,
.error,
.no-data {
  text-align: center;
  padding: 40px 0;
}

.loading {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.error {
  font-size: 1.1rem;
  color: #e74c3c;
}

.no-data {
  font-size: 1rem;
  color: #7f8c8d;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.chart-card,
.highlights-container {
  background: #ffffff;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.chart-card {
  height: 600px;
}

.chart-card:hover,
.highlights-container:hover {
  transform: translateY(-5px);
}

.chart-card h5,
.highlights-header h2 {
  margin: 0 0 15px;
  color: #34495e;
  font-size: 1.5rem;
  text-align: center;
}

.description {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 20px;
}

.highlights-header {
  text-align: center;
  margin-bottom: 30px;
}

.survey-id {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-card h3 {
  color: #2c3e50;
  font-size: 0.9rem;
  margin: 0 0 15px;
  display: flex;
  align-items: center;
}

.top-card {
  border-top: 4px solid #4caf50;
}

.bottom-card {
  border-top: 4px solid #f44336;
}

.photo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.photo-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.rank {
  font-weight: bold;
  margin-right: 10px;
  color: #34495e;
  min-width: 20px;
}

.photo-title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2c3e50;
  font-size: 0.9rem;
}

.photo-stat {
  margin-left: 10px;
  font-weight: bold;
  color: #7f8c8d;
  font-size: 0.75rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 80%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 5px;
}

.modal-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.3s ease;
}

.modal-close-btn:hover {
  background: #c0392b;
}

@media (max-width: 1024px) {
  .header-wrapper {
    flex-direction: column;
    gap: 20px;
  }

  .chart-card {
    height: 500px;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .chart-card {
    height: 450px;
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .highlights-container {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 15px;
  }

  .chart-card {
    height: 400px;
    padding: 15px;
  }

  .chart-dropdown {
    width: 100%;
    min-width: unset;
  }

  .dropdown-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    width: 100%;
  }

  .title {
    font-size: 1.1rem;
  }

  .title-container {
    flex-direction: column;
    gap: 10px;
  }

  .export-button {
    width: 100%;
  }
}
</style>
