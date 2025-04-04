<template>
  <div class="container">
    <!-- Anket Listesi Kartı -->
    <div class="card mb-4">
      <div class="card-header">
        <button
          v-if="userRole === 1"
          class="btn btn-primary btn-sm"
          @click="openAddModal"
        >
          Yeni Ekle
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-items-center mb-0">
            <thead class="thead-dark">
              <tr>
                <th>Sıra No</th>
                <th>Id</th>
                <th>Anket Adı</th>
                <th>Oluşturulma Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedData.length === 0">
                <td colspan="5" class="text-center">
                  <span class="text-sm font-weight-bold">{{
                    noDataMessage
                  }}</span>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in paginatedData" :key="item.id">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ item.id }}</td>
                <td>{{ item.surveyName }}</td>
                <td>{{ item.createdDate }}</td>
                <td class="action-buttons">
                  <template v-if="userRole === 1">
                    <button
                      class="btn btn-success btn-sm mx-1"
                      @click="openJuryModal(item)"
                    >
                      Jüriler
                    </button>
                    <button
                      class="btn btn-dark btn-sm mx-1"
                      @click="goToSurveyContent(item.id)"
                    >
                      Detaylar
                    </button>
                    <button
                      class="btn btn-warning btn-sm mx-1"
                      @click="openEditModal(item)"
                    >
                      Düzenle
                    </button>
                    <!-- <button                      class="btn btn-danger btn-sm mx-1"                      @click="openDeleteModal(item.id)"                    >                      Sil                    </button>  -->
                    <button
                      v-if="!item.isDeleted"
                      class="btn btn-secondary btn-sm mx-1"
                      @click="passivateSurvey(item.id)"
                    >
                      Pasifleştir
                    </button>
                    <button
                      v-else
                      class="btn btn-success btn-sm mx-1"
                      @click="activateSurvey(item.id)"
                    >
                      Aktifleştir
                    </button>
                    <button
                      class="btn btn-success btn-sm mx-1"
                      @click="goToSurveyResults(item.id)"
                    >
                      Sonuçlar
                    </button>
                  </template>
                  <template v-else-if="userRole === 2">
                    <button
                      class="btn btn-info btn-sm mx-1"
                      @click="goToScore(item.id)"
                    >
                      Puanla
                    </button>
                  </template>
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
          Toplam Veri: {{ apiData.length }}
        </div>
      </div>
    </div>

    <!-- Yeni Ekle Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content">
        <h5>Yeni Anket Ekle</h5>
        <div class="form-group">
          <label>Anket Adı <span class="required">*</span></label>
          <input
            v-model="newSurveyName"
            type="text"
            class="form-control mb-3"
            :class="{ 'is-invalid': addFormErrors.surveyName }"
            placeholder="Anket Adı"
            required
            @input="validateAddForm"
          />
          <div v-if="addFormErrors.surveyName" class="invalid-feedback">
            Anket adı zorunludur
          </div>
        </div>

        <div class="form-group">
          <label>Açıklama</label>
          <textarea
            v-model="newSurveyDescription"
            class="form-control mb-3"
            placeholder="Açıklama"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Dosya Yolu <span class="required">*</span></label>
          <div class="input-group mb-3">
            <input
              v-model="newSurveyPath"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': addFormErrors.surveyPath }"
              placeholder="Dosya Yolu"
              readonly
              required
            />
            <button class="btn btn-outline-secondary" @click="openFolderDialog">
              Klasör Seç
            </button>
          </div>
          <div v-if="addFormErrors.surveyPath" class="invalid-feedback">
            Dosya yolu zorunludur
          </div>
        </div>

        <div class="form-group">
          <label>Planlanan Bitiş Tarihi <span class="required">*</span></label>
          <input
            v-model="newSurveyPlannedEndDate"
            type="date"
            class="form-control mb-3"
            :class="{ 'is-invalid': addFormErrors.surveyDate }"
            required
            @input="validateAddForm"
          />
          <div v-if="addFormErrors.surveyDate" class="invalid-feedback">
            Tarih zorunludur
          </div>
        </div>

        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="saveNewSurvey"
            :disabled="!isAddFormValid"
          >
            Kaydet
          </button>
          <button class="btn btn-secondary" @click="closeAddModal">
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
        <h5>Anket Düzenle (ID: {{ selectedSurvey.id }})</h5>
        <input
          v-model="editSurveyName"
          type="text"
          class="form-control mb-3"
          placeholder="Anket Adı"
        />
        <textarea
          v-model="editSurveyDescription"
          class="form-control mb-3"
          placeholder="Açıklama"
          rows="3"
        ></textarea>
        <div class="input-group mb-3">
          <input
            v-model="editSurveyPath"
            type="text"
            class="form-control"
            placeholder="Dosya Yolu"
            readonly
          />
          <button class="btn btn-outline-secondary" @click="openFolderDialog">
            Klasör Seç
          </button>
        </div>
        <input
          v-model="editSurveyPlannedEndDate"
          type="date"
          class="form-control mb-3"
        />
        <div class="modal-buttons">
          <button class="btn btn-primary" @click="saveEditSurvey">
            Kaydet
          </button>
          <button class="btn btn-secondary" @click="closeEditModal">
            Kapat
          </button>
        </div>
      </div>
    </div>

    <!-- Jüri Modal -->
    <div
      v-if="showJuryModal"
      class="modal-overlay"
      @click.self="closeJuryModal"
    >
      <div class="modal-content">
        <h5>Jüri Ekle (ID: {{ selectedSurvey.id }})</h5>
        <div class="jury-list">
          <div v-for="jury in jurors" :key="jury.id" class="jury-item">
            <input
              type="checkbox"
              class="form-check-input"
              :id="'jury-' + jury.id"
              v-model="selectedJurors"
              :value="jury.id"
            />
            <label class="form-check-label" :for="'jury-' + jury.id">
              {{ jury.username }} ({{ jury.email }})
            </label>
          </div>
        </div>
        <div class="modal-buttons">
          <button class="btn btn-primary" @click="saveJury">Kaydet</button>
          <button class="btn btn-secondary" @click="closeJuryModal">
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
        <p>Anket ID {{ deleteSurveyId }} silinsin mi?</p>
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

    <!-- Klasör Seç Modal (Tree Yapısı) -->
    <div
      v-if="showFolderModal"
      class="modal-overlay"
      @click.self="closeFolderModal"
    >
      <div class="modal-content folder-modal">
        <div class="modal-header">
          <h5>
            <i class="fas fa-folder-open"></i>
            Klasör Seçin
          </h5>
          <button class="close-btn" @click="closeFolderModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <folder-tree
            :tree-data="folderTree"
            @select-folder="selectFolder"
          ></folder-tree>
        </div>
        <div class="modal-footer">
          <div class="selected-path">
            <span v-if="showAddModal && newSurveyPath">
              <i class="fas fa-check-circle"></i> Seçilen: {{ newSurveyPath }}
            </span>
            <span v-else-if="showEditModal && editSurveyPath">
              <i class="fas fa-check-circle"></i> Seçilen: {{ editSurveyPath }}
            </span>
            <span v-else class="text-muted">
              <i class="fas fa-info-circle"></i> Bir klasör seçin
            </span>
          </div>
          <button class="btn btn-secondary" @click="closeFolderModal">
            Kapat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import FolderTree from "./components/FolderTree.vue";

export default {
  components: {
    FolderTree,
  },
  data() {
    return {
      addFormErrors: {
        surveyName: false,
        surveyPath: false,
        surveyDate: false,
      },
      isAddFormValid: false,
      apiData: [],
      jurors: [],
      folderTree: null,
      noDataMessage: "Veri yükleniyor...",
      currentPage: 1,
      itemsPerPage: 10,
      showAddModal: false,
      showEditModal: false,
      showJuryModal: false,
      showDeleteModal: false,
      showFolderModal: false,
      newSurveyName: "",
      newSurveyDescription: "",
      newSurveyPath: "",
      newSurveyPlannedEndDate: "",
      editSurveyName: "",
      editSurveyDescription: "",
      editSurveyPath: "",
      editSurveyPlannedEndDate: "",
      selectedSurvey: {},
      deleteSurveyId: null,
      selectedJurors: [],
      userRole: null,
      userId: null,
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
    validateAddForm() {
      this.addFormErrors = {
        surveyName: !this.newSurveyName.trim(),
        surveyPath: !this.newSurveyPath.trim(),
        surveyDate: !this.newSurveyPlannedEndDate,
      };

      this.isAddFormValid = !Object.values(this.addFormErrors).some(
        (error) => error
      );
    },

    async saveNewSurvey() {
      this.validateAddForm();

      if (!this.isAddFormValid) {
        return;
      }

      // Orijinal kaydetme işlemi
      if (!this.newSurveyName.trim()) return alert("Anket adı boş olamaz!");
      try {
        const token = localStorage.getItem("token");
        const newSurvey = {
          id: 0,
          isDeleted: false,
          title: this.newSurveyName,
          description: this.newSurveyDescription,
          path: this.newSurveyPath,
          plannedEndDate: this.newSurveyPlannedEndDate
            ? new Date(this.newSurveyPlannedEndDate).toISOString()
            : null,
        };
        const response = await axios.post(
          "https://localhost:7263/api/Survey/CreateOrEditSurvey",
          newSurvey,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.apiData.push({
          id: response.data.data.id,
          surveyName: response.data.data.title,
          description: response.data.data.description || "",
          createdDate:
            response.data.data.createdDate?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          filePath: response.data.data.path || "",
          plannedEndDate: response.data.data.plannedEndDate || "",
          jurors: [],
          isDeleted: false,
        });
        this.closeAddModal();
      } catch (error) {
        console.error("Yeni anket ekleme hatası:", error);
        alert("Anket eklenirken hata oluştu!");
      }
    },

    fetchUserRole() {
      this.userRole = parseInt(localStorage.getItem("role"), 10) || null;
      this.userId = parseInt(localStorage.getItem("userId"), 10) || null;
    },

    async fetchSurveys() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://localhost:7263/api/Survey/GetMy",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.apiData = (response.data.data || []).map((item) => ({
          id: item.id,
          surveyName: item.title,
          description: item.description || "",
          createdDate:
            item.createdDate?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          filePath: item.path || "",
          plannedEndDate: item.plannedEndDate || "",
          jurors: item.jurors || [],
          isDeleted: item.isDeleted || false,
        }));
        this.noDataMessage = this.apiData.length === 0 ? "Veri yok" : "";
      } catch (error) {
        console.error("Anketleri çekerken hata:", error);
        this.noDataMessage = "Veri çekilirken hata oluştu";
      }
    },

    async fetchJurors(surveyId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://localhost:7263/api/User/GetAllJurry/${surveyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.jurors = response.data.data || [];
      } catch (error) {
        console.error("Jüri listesi çekerken hata:", error);
        this.jurors = [];
      }
    },

    async openFolderDialog() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://localhost:7263/api/System/ListFolders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          this.folderTree = response.data.data;
          this.showFolderModal = true;
        } else {
          alert("Klasörler yüklenemedi: " + response.data.message);
        }
      } catch (error) {
        console.error("Klasör listeleme hatası:", error);
        alert("Klasörler yüklenirken hata oluştu!");
      }
    },

    selectFolder(path) {
      if (this.showAddModal) this.newSurveyPath = path;
      else if (this.showEditModal) this.editSurveyPath = path;
      this.closeFolderModal();
    },

    closeFolderModal() {
      this.showFolderModal = false;
      this.folderTree = null;
    },

    async passivateSurvey(id) {
      try {
        const token = localStorage.getItem("token");
        await axios.get(`https://localhost:7263/api/Survey/Passive/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const survey = this.apiData.find((item) => item.id === id);
        if (survey) survey.isDeleted = true;
        alert("Anket başarıyla pasifleştirildi");
      } catch (error) {
        console.error("Pasifleştirme hatası:", error);
        alert("Anket pasifleştirilirken hata oluştu!");
      }
    },

    async activateSurvey(id) {
      try {
        const token = localStorage.getItem("token");
        await axios.get(`https://localhost:7263/api/Survey/Active/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const survey = this.apiData.find((item) => item.id === id);
        if (survey) survey.isDeleted = false;
        alert("Anket başarıyla aktifleştirildi");
      } catch (error) {
        console.error("Aktifleştirme hatası:", error);
        alert("Anket aktifleştirilirken hata oluştu!");
      }
    },

    goToScore(id) {
      this.$router.push(`/survey/${id}/${this.userId}`);
    },
    goToSurveyContent(id) {
      this.$router.push(`/survey-content/${id}`);
    },
    goToSurveyResults(id) {
      this.$router.push(`/survey-detail-chart/${id}`);
    },

    openAddModal() {
      this.newSurveyName = "";
      this.newSurveyDescription = "";
      this.newSurveyPath = "";
      this.newSurveyPlannedEndDate = "";
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },

    openEditModal(survey) {
      this.selectedSurvey = survey;
      this.editSurveyName = survey.surveyName;
      this.editSurveyDescription = survey.description;
      this.editSurveyPath = survey.filePath;
      this.editSurveyPlannedEndDate = survey.plannedEndDate?.slice(0, 10) || "";
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    async saveEditSurvey() {
      if (!this.editSurveyName.trim()) return alert("Anket adı boş olamaz!");
      try {
        const token = localStorage.getItem("token");
        const updatedSurvey = {
          id: this.selectedSurvey.id,
          isDeleted: this.selectedSurvey.isDeleted,
          title: this.editSurveyName,
          description: this.editSurveyDescription,
          path: this.editSurveyPath,
          plannedEndDate: this.editSurveyPlannedEndDate
            ? new Date(this.editSurveyPlannedEndDate).toISOString()
            : null,
        };
        await axios.post(
          "https://localhost:7263/api/Survey/CreateOrEditSurvey",
          updatedSurvey,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Object.assign(this.selectedSurvey, {
          surveyName: this.editSurveyName,
          description: this.editSurveyDescription,
          filePath: this.editSurveyPath,
          plannedEndDate: this.editSurveyPlannedEndDate
            ? new Date(this.editSurveyPlannedEndDate).toISOString()
            : null,
        });
        this.closeEditModal();
      } catch (error) {
        console.error("Anket güncelleme hatası:", error);
        alert("Anket güncellenirken hata oluştu!");
      }
    },

    openJuryModal(survey) {
      this.selectedSurvey = survey;
      this.fetchJurors(survey.id).then(() => {
        this.selectedJurors = this.jurors
          .filter((jury) => jury.isJurry)
          .map((jury) => jury.id);
        this.showJuryModal = true;
      });
    },
    closeJuryModal() {
      this.showJuryModal = false;
    },
    async saveJury() {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "https://localhost:7263/api/JuryAssignment/update-jurors",
          {
            surveyId: this.selectedSurvey.id,
            selectedJuryIds: this.selectedJurors,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.selectedSurvey.jurors = [...this.selectedJurors];
        this.closeJuryModal();
      } catch (error) {
        console.error("Jüri güncelleme hatası:", error);
        alert("Jüriler güncellenirken hata oluştu!");
      }
    },

    openDeleteModal(id) {
      this.deleteSurveyId = id;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
    },
    async confirmDelete() {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://localhost:7263/api/Survey/DeleteSurvey/${this.deleteSurveyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.apiData = this.apiData.filter(
          (item) => item.id !== this.deleteSurveyId
        );
        this.closeDeleteModal();
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Anket silinirken hata oluştu!");
      }
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
  },
  mounted() {
    this.fetchUserRole();
    this.fetchSurveys();
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  padding: 20px;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.card-header {
  background-color: #f8fafc;
  padding: 12px 20px;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
}

.card-body {
  padding: 20px;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.thead-dark {
  background-color: #1e3a8a;
  color: #fff;
}

th,
td {
  padding: 12px;
  text-align: left;
}

.table-hover tbody tr:hover {
  background-color: #f1f5f9;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #60a5fa;
  color: #fff;
  border: none;
}
.btn-primary:hover {
  background-color: #3b82f6;
}

.btn-success {
  background-color: #6ee7b7;
  color: #fff;
  border: none;
}
.btn-success:hover {
  background-color: #10b981;
}

.btn-warning {
  background-color: #fcd34d;
  color: #fff;
  border: none;
}
.btn-warning:hover {
  background-color: #f59e0b;
}

.btn-danger {
  background-color: #f87171;
  color: #fff;
  border: none;
}
.btn-danger:hover {
  background-color: #ef4444;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
}
.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn-dark {
  background-color: #334155;
  color: #fff;
  border: none;
}
.btn-dark:hover {
  background-color: #1e293b;
}

.btn-info {
  background-color: #7dd3fc;
  color: #fff;
  border: none;
}
.btn-info:hover {
  background-color: #0ea5e9;
}

.btn-outline-primary {
  border: 1px solid #60a5fa;
  color: #60a5fa;
  background-color: #fff;
}
.btn-outline-primary:hover {
  background-color: #60a5fa;
  color: #fff;
}
.btn-outline-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline-secondary {
  border: 1px solid #e2e8f0;
  color: #475569;
}
.btn-outline-secondary:hover {
  background-color: #e2e8f0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #60a5fa;
  background-color: #fff;
  color: #60a5fa;
  cursor: pointer;
}
.page-btn:hover {
  background-color: #60a5fa;
  color: #fff;
}
.page-btn.active {
  background-color: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.total-data {
  font-size: 0.9rem;
  color: #475569;
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
}

.modal-content h5 {
  margin-bottom: 15px;
  color: #1e3a8a;
  font-weight: 600;
}

.form-control {
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.input-group {
  display: flex;
}

.input-group .form-control {
  flex-grow: 1;
}

.jury-list {
  max-height: 250px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #f8fafc;
}

.jury-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.form-check-input {
  margin-right: 10px;
}

.form-check-label {
  color: #475569;
  font-size: 0.9rem;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
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
}
/* Ana component'in style bölümüne ekleyin */
.modal-overlay .folder-modal {
  width: 500px;
  max-width: 95%;
  padding: 0;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
}

.modal-header h5 {
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  color: #1e40af;
}

.modal-header h5 i {
  margin-right: 10px;
  color: #f6c453;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 5px;
}

.close-btn:hover {
  color: #ef4444;
}

.modal-body {
  padding: 15px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
}

.selected-path {
  font-size: 0.85rem;
  color: #4b5563;
}

.selected-path i {
  margin-right: 5px;
}

.text-muted {
  color: #9ca3af;
}

.fa-check-circle {
  color: #10b981;
}

.fa-info-circle {
  color: #6b7280;
}
.required {
  color: #ef4444;
}

.is-invalid {
  border-color: #ef4444 !important;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}
</style>
