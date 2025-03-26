<template>
  <div class="container">
    <div class="card mb-4">
      <div class="card-header">
        <button class="btn btn-primary btn-sm" @click="openAddModal">
          Yeni Ekle
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-items-center mb-0">
            <thead class="thead-dark">
              <tr>
                <th
                  class="text-uppercase text-light text-xs font-weight-bolder"
                >
                  Sıra No
                </th>
                <th
                  class="text-uppercase text-light text-xs font-weight-bolder"
                >
                  Resim
                </th>
                <th
                  class="text-uppercase text-light text-xs font-weight-bolder"
                >
                  Resim Adı
                </th>
                <th
                  class="text-uppercase text-light text-xs font-weight-bolder"
                >
                  Anket Adı
                </th>
                <th
                  class="text-uppercase text-light text-xs font-weight-bolder"
                >
                  Aldığı Oy Sayısı
                </th>
                <th
                  class="text-uppercase text-light text-xs font-weight-bolder"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedData.length === 0">
                <td colspan="6" class="text-center">
                  <span class="text-sm font-weight-bold">{{
                    noDataMessage || "Veri yok"
                  }}</span>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in paginatedData" :key="item.id">
                <td>
                  <span class="text-xs font-weight-bold">{{
                    (currentPage - 1) * itemsPerPage + index + 1
                  }}</span>
                </td>
                <td>
                  <img
                    :src="item.imageUrl"
                    alt="Resim"
                    class="survey-image"
                    @click="openImageModal(item)"
                  />
                </td>
                <td>
                  <span class="text-xs font-weight-bold">{{
                    item.imageName
                  }}</span>
                </td>
                <td>
                  <span class="text-xs font-weight-bold">{{
                    item.surveyName
                  }}</span>
                </td>
                <td>
                  <span class="text-xs font-weight-bold">{{
                    item.voteCount
                  }}</span>
                </td>
                <td class="action-buttons">
                  <button
                    class="btn btn-dark btn-sm mx-1"
                    @click="goToReviewScreen(item.id)"
                  >
                    Detaylar
                  </button>
                  <button
                    class="btn btn-warning btn-sm mx-1"
                    @click="openEditModal(item)"
                  >
                    Düzenle
                  </button>
                  <button
                    class="btn btn-danger btn-sm mx-1"
                    @click="openDeleteModal(item.id)"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-container mt-3">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="btn btn-outline-primary mx-2"
          >
            Önceki
          </button>
          <div class="page-numbers">
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
            class="btn btn-outline-primary mx-2"
          >
            Sonraki
          </button>
        </div>
        <div class="total-data text-right mt-2">
          <span class="text-sm font-weight-bold"
            >Toplam Veri: {{ apiData.length }}</span
          >
        </div>
      </div>

      <!-- Yeni Ekle Modal -->
      <div
        v-if="showAddModal"
        class="modal-overlay"
        @click.self="closeAddModal"
      >
        <div class="modal-content">
          <h5>Yeni Anket İçeriği Ekle</h5>
          <input
            v-model="newImageUrl"
            type="text"
            class="form-control mb-3"
            placeholder="Resim URL'si"
          />
          <input
            v-model="newImageName"
            type="text"
            class="form-control mb-3"
            placeholder="Resim Adı"
          />
          <input
            v-model="newSurveyName"
            type="text"
            class="form-control mb-3"
            placeholder="Anket Adı"
          />
          <!-- Aldığı Oy Sayısı için güncellenmiş giriş -->
          <input
            v-model.number="newVoteCount"
            type="number"
            class="form-control mb-3"
            placeholder="Aldığı Oy Sayısını Girin"
            min="0"
            step="1"
          />
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveNewSurveyContent">
              Kaydet
            </button>
            <button class="btn btn-secondary" @click="closeAddModal">
              Kapat
            </button>
          </div>
        </div>
      </div>

      <!-- Detaylar Modal -->
      <div
        v-if="showDetailsModal"
        class="modal-overlay"
        @click.self="closeDetailsModal"
      >
        <div class="modal-content">
          <h5>Anket İçeriği Detayları (ID: {{ selectedContent.id }})</h5>
          <div class="details-content">
            <p><strong>Resim:</strong></p>
            <img
              :src="selectedContent.imageUrl"
              alt="Resim"
              class="survey-image-large"
            />
            <p><strong>Resim Adı:</strong> {{ selectedContent.imageName }}</p>
            <p><strong>Anket Adı:</strong> {{ selectedContent.surveyName }}</p>
            <p>
              <strong>Aldığı Oy Sayısı:</strong> {{ selectedContent.voteCount }}
            </p>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-secondary" @click="closeDetailsModal">
              Kapat
            </button>
          </div>
        </div>
      </div>

      <!-- Düzenle Modal -->
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal-content">
          <h5>Anket İçeriği Düzenle (ID: {{ selectedContent.id }})</h5>
          <input
            v-model="editImageUrl"
            type="text"
            class="form-control mb-3"
            placeholder="Resim URL'si"
          />
          <input
            v-model="editImageName"
            type="text"
            class="form-control mb-3"
            placeholder="Resim Adı"
          />
          <input
            v-model="editSurveyName"
            type="text"
            class="form-control mb-3"
            placeholder="Anket Adı"
          />
          <input
            v-model.number="editVoteCount"
            type="number"
            class="form-control mb-3"
            placeholder="Aldığı Oy Sayısı"
          />
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveEditSurveyContent">
              Kaydet
            </button>
            <button class="btn btn-secondary" @click="closeEditModal">
              Kapat
            </button>
          </div>
        </div>
      </div>

      <!-- Silme Modal -->
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="closeDeleteModal"
      >
        <div class="modal-content">
          <h5>Silme Onayı</h5>
          <p>Anket İçeriği ID {{ deleteContentId }} silinsin mi?</p>
          <div class="modal-buttons">
            <button class="btn btn-danger" @click="confirmDelete">
              Evet, Sil
            </button>
            <button class="btn btn-secondary" @click="closeDeleteModal">
              Hayır
            </button>
          </div>
        </div>
      </div>

      <!-- Resim Büyütme Modal -->
      <div
        v-if="showImageModal"
        class="modal-overlay"
        @click.self="closeImageModal"
      >
        <div class="modal-content">
          <h5>{{ selectedContent.imageName }}</h5>
          <img
            :src="selectedContent.imageUrl"
            alt="Büyük Resim"
            class="survey-image-expanded"
          />
          <div class="modal-buttons">
            <button class="btn btn-secondary" @click="closeImageModal">
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SurveyContent",
  data() {
    return {
      surveyId: this.$route.params.id,
      apiData: [],
      noDataMessage: "Veri yükleniyor...",
      currentPage: 1,
      itemsPerPage: 10,
      showAddModal: false,
      showDetailsModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showImageModal: false,
      newImageUrl: "",
      newImageName: "",
      newSurveyName: "",
      newVoteCount: 0,
      editImageUrl: "",
      editImageName: "",
      editSurveyName: "",
      editVoteCount: 0,
      selectedContent: {},
      deleteContentId: null,
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
  methods: {
    async fetchSurveyContent() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token bulunamadı, lütfen giriş yapın.");
        }

        console.log("surveyId:", this.surveyId);

        const response = await axios.get(
          `https://localhost:7263/api/Survey/GetSurveyContent/${this.surveyId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const surveyContentData = response.data.data || [];
        this.apiData = surveyContentData.map((item) => ({
          id: item.photoId,
          imageUrl: item.photoPath, // Şu an yerel yol, aşağıda çözüm önerisi var
          imageName: item.photoTitle,
          surveyName: item.surveyName,
          voteCount: item.voteUserCount,
        }));

        if (this.apiData.length === 0) {
          this.noDataMessage = "Veri yok";
        }
      } catch (error) {
        console.error("Anket içeriği çekerken hata:", error);
        this.noDataMessage = "Veri çekilirken hata oluştu";
        this.apiData = [];
      }
    },
    openAddModal() {
      this.newImageUrl = "";
      this.newImageName = "";
      this.newSurveyName = "";
      this.newVoteCount = 0;
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    goToReviewScreen(photoId) {
      try {
        this.$router.push({
          name: "ReviewScreen",
          params: {
            surveyId: this.surveyId, // Mevcut surveyId
            photoId: photoId, // Tıklanan resmin photoId'si
          },
        });
      } catch (error) {
        console.error("ReviewScreen'e yönlendirme hatası:", error);
      }
    },
    saveNewSurveyContent() {
      if (
        this.newImageName.trim() &&
        this.newSurveyName.trim() &&
        Number.isInteger(this.newVoteCount) &&
        this.newVoteCount >= 0
      ) {
        const newId = this.apiData.length
          ? Math.max(...this.apiData.map((item) => item.id)) + 1
          : 1;
        this.apiData.push({
          id: newId,
          imageUrl: this.newImageUrl || "https://via.placeholder.com/50",
          imageName: this.newImageName,
          surveyName: this.newSurveyName,
          voteCount: this.newVoteCount,
        });
        this.closeAddModal();
      } else {
        alert(
          "Resim adı, anket adı boş olamaz ve aldığı oy sayısı geçerli bir tam sayı olmalı!"
        );
      }
    },
    openDetailsModal(content) {
      this.selectedContent = content;
      this.showDetailsModal = true;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
    },
    openEditModal(content) {
      this.selectedContent = content;
      this.editImageUrl = content.imageUrl;
      this.editImageName = content.imageName;
      this.editSurveyName = content.surveyName;
      this.editVoteCount = content.voteCount;
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    saveEditSurveyContent() {
      if (this.editImageName.trim() && this.editSurveyName.trim()) {
        this.selectedContent.imageUrl = this.editImageUrl;
        this.selectedContent.imageName = this.editImageName;
        this.selectedContent.surveyName = this.editSurveyName;
        this.selectedContent.voteCount = this.editVoteCount;
        this.closeEditModal();
      } else {
        alert("Resim adı ve anket adı boş olamaz!");
      }
    },
    openDeleteModal(id) {
      this.deleteContentId = id;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
    },
    confirmDelete() {
      this.apiData = this.apiData.filter(
        (item) => item.id !== this.deleteContentId
      );
      this.closeDeleteModal();
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    },
    openImageModal(content) {
      this.selectedContent = content;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
    },
  },
  mounted() {
    this.fetchSurveyContent();
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  width: 100%;
  background-color: #fff;
}

.card-header {
  background-color: #f8fafc;
  padding: 12px 20px;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
  text-align: left;
}

.btn-primary {
  background-color: #60a5fa;
  border: none;
  padding: 8px 16px;
  font-size: 0.85rem;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-primary:hover {
  background-color: #3b82f6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  justify-content: flex-start;
  align-items: center;
}

.btn {
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-dark {
  background-color: #334155;
  color: #fff;
  border: none;
}
.btn-dark:hover {
  background-color: #1e293b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-warning {
  background-color: #fcd34d;
  color: #fff;
  border: none;
}
.btn-warning:hover {
  background-color: #f59e0b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-danger {
  background-color: #f87171;
  color: #fff;
  border: none;
}
.btn-danger:hover {
  background-color: #ef4444;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
  padding: 8px 16px;
  font-size: 0.85rem;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}
.btn-secondary:hover {
  background-color: #cbd5e1;
  color: #334155;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-outline-primary {
  background-color: #fff;
  color: #60a5fa;
  border: 1px solid #60a5fa;
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}
.btn-outline-primary:hover {
  background-color: #60a5fa;
  color: #fff;
}
.btn-outline-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #60a5fa;
  background-color: #fff;
  color: #60a5fa;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.page-btn:hover {
  background-color: #60a5fa;
  color: #fff;
}
.page-btn.active {
  background-color: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
  font-weight: 600;
}

.card-body {
  padding: 20px;
}

.table-responsive {
  overflow-x: auto;
  width: 100%;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.thead-dark {
  background-color: #1e3a8a;
  color: #fff;
}

th,
td {
  padding: 12px;
  text-align: left;
  white-space: nowrap;
}

th:nth-child(1),
td:nth-child(1) {
  width: 10%;
}
th:nth-child(2),
td:nth-child(2) {
  width: 15%;
}
th:nth-child(3),
td:nth-child(3) {
  width: 20%;
}
th:nth-child(4),
td:nth-child(4) {
  width: 25%;
}
th:nth-child(5),
td:nth-child(5) {
  width: 15%;
}
th:nth-child(6),
td:nth-child(6) {
  width: 25%;
}

.table-hover tbody tr:hover {
  background-color: #f1f5f9;
}

.survey-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.survey-image-large {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
}

.survey-image-expanded {
  width: 300px;
  height: 300px;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.total-data {
  font-size: 0.9rem;
  color: #475569;
  text-align: right;
  padding: 5px;
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
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
}

.modal-content h5 {
  margin-bottom: 15px;
  color: #1e3a8a;
  font-weight: 600;
  font-size: 1.1rem;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.details-content {
  margin-bottom: 20px;
}

.details-content p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #475569;
}

.details-content strong {
  color: #1e3a8a;
  font-weight: 600;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}

@media (min-width: 1200px) {
  .container {
    padding: 20px 40px;
  }
}

@media (max-width: 768px) {
  .card-header {
    text-align: center;
  }
  .total-data {
    text-align: center;
  }
  .action-buttons {
    gap: 4px;
  }
  .btn {
    padding: 5px 10px;
    font-size: 0.75rem;
  }
  .table th,
  .table td {
    padding: 8px;
    font-size: 0.75rem;
  }
  .modal-content {
    width: 90%;
  }
  .survey-image {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 576px) {
  .modal-content {
    width: 95%;
    padding: 15px;
  }
  .btn-primary,
  .btn-secondary {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  .survey-image-expanded {
    width: 200px;
    height: 200px;
  }
}
</style>
