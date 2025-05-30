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
        <!-- Arama Alanı -->
        <div class="search-container mt-3">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Anket Adı, Oluşturulma Tarihi veya Bitiş Tarihi ile Ara..."
          />
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-items-center mb-0">
            <thead class="thead-dark">
              <tr>
                <th>Sıra No</th>
                <th>Id</th>
                <th class="sortable" @click="sort('surveyName')">
                  Anket Adı
                  <span v-if="sortKey === 'surveyName'">
                    {{ sortOrder === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
                <th class="sortable" @click="sort('createdDate')">
                  Oluşturulma Tarihi
                  <span v-if="sortKey === 'createdDate'">
                    {{ sortOrder === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
                <th class="sortable" @click="sort('plannedEndDate')">
                  Planlanan Bitiş Tarihi
                  <span v-if="sortKey === 'plannedEndDate'">
                    {{ sortOrder === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedData.length === 0">
                <td colspan="6" class="text-center">
                  <span class="text-sm font-weight-bold">{{
                    noDataMessage
                  }}</span>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in paginatedData" :key="item.id">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ item.id }}</td>
                <td>{{ item.surveyName }}</td>
                <td>{{ formatDate(item.createdDate) }}</td>
                <td>{{ formatDate(item.plannedEndDate) }}</td>
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
                    <button
                      v-if="item.isActive"
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
          Toplam Veri: {{ filteredData.length }}
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
          <!-- <input
            :value="formattedDate"
            type="text"
            class="form-control mt-2"
            placeholder="GG-AA-YYYY"
            readonly
          /> -->
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
        <div class="form-group">
          <label>Anket Adı <span class="required">*</span></label>
          <input
            v-model="editSurveyName"
            type="text"
            class="form-control mb-3"
            :class="{ 'is-invalid': editFormErrors.surveyName }"
            placeholder="Anket Adı"
            required
            @input="validateEditForm"
          />
          <div v-if="editFormErrors.surveyName" class="invalid-feedback">
            Anket adı zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Açıklama</label>
          <textarea
            v-model="editSurveyDescription"
            class="form-control mb-3"
            placeholder="Açıklama"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Dosya Yolu <span class="required">*</span></label>
          <div class="input-group mb-3">
            <input
              v-model="editSurveyPath"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': editFormErrors.surveyPath }"
              placeholder="Dosya Yolu"
              readonly
              required
            />
            <button class="btn btn-outline-secondary" @click="openFolderDialog">
              Klasör Seç
            </button>
          </div>
          <div v-if="editFormErrors.surveyPath" class="invalid-feedback">
            Dosya yolu zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Planlanan Bitiş Tarihi <span class="required">*</span></label>
          <input
            v-model="editSurveyPlannedEndDate"
            type="date"
            class="form-control mb-3"
            :class="{ 'is-invalid': editFormErrors.surveyDate }"
            required
            @input="validateEditForm"
          />
          <input
            :value="editFormattedDate"
            type="text"
            class="form-control mt-2"
            placeholder="GG-AA-YYYY"
            readonly
          />
          <div v-if="editFormErrors.surveyDate" class="invalid-feedback">
            Tarih zorunludur
          </div>
        </div>
        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="saveEditSurvey"
            :disabled="!isEditFormValid"
          >
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
import { format } from "date-fns";
import FolderTree from "./components/FolderTree.vue";
import Swal from "sweetalert2";
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
      editFormErrors: {
        surveyName: false,
        surveyPath: false,
        surveyDate: false,
      },
      isAddFormValid: false,
      isEditFormValid: false,
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
      searchQuery: "",
      sortKey: "",
      sortOrder: "asc",

      isLoading: false, //
    };
  },
  computed: {
    formattedDate() {
      return this.newSurveyPlannedEndDate
        ? format(new Date(this.newSurveyPlannedEndDate), "dd-MM-yyyy")
        : "";
    },
    editFormattedDate() {
      return this.editSurveyPlannedEndDate
        ? format(new Date(this.editSurveyPlannedEndDate), "dd-MM-yyyy")
        : "";
    },
    filteredData() {
      let filtered = [...this.apiData];
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.surveyName.toLowerCase().includes(query) ||
            this.formatDate(item.createdDate).toLowerCase().includes(query) ||
            this.formatDate(item.plannedEndDate).toLowerCase().includes(query)
        );
      }
      if (this.sortKey) {
        filtered.sort((a, b) => {
          let valueA = a[this.sortKey];
          let valueB = b[this.sortKey];
          if (
            this.sortKey === "createdDate" ||
            this.sortKey === "plannedEndDate"
          ) {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
          } else {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
          }
          if (this.sortOrder === "asc") {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
      }
      return filtered;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredData.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return "";
      try {
        return format(new Date(date), "dd-MM-yyyy");
      } catch {
        return date.split("T")[0];
      }
    },
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
    validateEditForm() {
      this.editFormErrors = {
        surveyName: !this.editSurveyName.trim(),
        surveyPath: !this.editSurveyPath.trim(),
        surveyDate: !this.editSurveyPlannedEndDate,
      };
      this.isEditFormValid = !Object.values(this.editFormErrors).some(
        (error) => error
      );
    },
    async saveNewSurvey() {
      this.validateAddForm();
      if (!this.isAddFormValid) return;

      this.isLoading = true; // Spinner'ı başlat
      Swal.fire({
        title: "Kaydediliyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const token = localStorage.getItem("token");
        const newSurvey = {
          id: 0,
          isDeleted: false,
          isActive: true,
          title: this.newSurveyName,
          description: this.newSurveyDescription,
          path: this.newSurveyPath,
          plannedEndDate: this.newSurveyPlannedEndDate || null,
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
          isDeleted: response.data.data.isDeleted || false,
          isActive: response.data.data.isActive ?? true,
        });
        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Kayıt Başarılı",
          text: "Yeni anket başarıyla kaydedildi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeAddModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Anket eklenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
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
          isActive: item.isActive ?? true,
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
      if (this.showAddModal) {
        this.newSurveyPath = path;
        this.validateAddForm();
      } else if (this.showEditModal) {
        this.editSurveyPath = path;
        this.validateEditForm();
      }
      this.closeFolderModal();
    },
    closeFolderModal() {
      this.showFolderModal = false;
      this.folderTree = null;
    },
    async passivateSurvey(id) {
      this.isLoading = true; // Spinner'ı başlat

      Swal.fire({
        title: "Paisifleştiriliyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const token = localStorage.getItem("token");
        await axios.get(
          `https://localhost:7263/api/Survey/Passive/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const survey = this.apiData.find((item) => item.id === id);
        if (survey) survey.isActive = false;

        this.isLoading = false; // Spinner'ı kapat
        Swal.fire({
          icon: "success",
          title: "Pasifleştirme Başarılı",
          text: "Anket başarıyla pasifleştirildi!",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Anket pasifleştilirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      }
    },
    async activateSurvey(id) {
      this.isLoading = true; // Spinner'ı başlat

      Swal.fire({
        title: "Aktifleştirilyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const token = localStorage.getItem("token");
        await axios.get(
          `https://localhost:7263/api/Survey/Active/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const survey = this.apiData.find((item) => item.id === id);
        if (survey) survey.isActive = true;
        this.isLoading = false; // Spinner'ı kapat
        Swal.fire({
          icon: "success",
          title: "Aktifleştirme Başarılı",
          text: "Anket başarıyla aktifleştirildi!",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Anket aktifleştirirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
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
      this.addFormErrors = {
        surveyName: false,
        surveyPath: false,
        surveyDate: false,
      };
      this.isAddFormValid = false;
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
      this.editSurveyPlannedEndDate =
        survey.plannedEndDate?.split("T")[0] || "";
      this.editFormErrors = {
        surveyName: false,
        surveyPath: false,
        surveyDate: false,
      };
      this.isEditFormValid = true;
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    async saveEditSurvey() {
      this.validateEditForm();
      if (!this.isEditFormValid) return;
      this.isLoading = true; // Spinner'ı başlat
      Swal.fire({
        title: "Güncelleniyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const token = localStorage.getItem("token");
        const updatedSurvey = {
          id: this.selectedSurvey.id,
          isDeleted: this.selectedSurvey.isDeleted,
          isActive: this.selectedSurvey.isActive,
          title: this.editSurveyName,
          description: this.editSurveyDescription,
          path: this.editSurveyPath,
          plannedEndDate: this.editSurveyPlannedEndDate || null,
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
          plannedEndDate: this.editSurveyPlannedEndDate || null,
        });
        this.isLoading = false; // Spinner'ı kapat
        Swal.fire({
          icon: "success",
          title: "Güncelleme Başarılı",
          text: "Anket başarıyla güncellendi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeEditModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Anket güncellenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
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
      this.isLoading = true; // Spinner'ı başlat
      Swal.fire({
        title: "Jüriler Kaydediliyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
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

        this.isLoading = false; // Spinner'ı kapat
        Swal.fire({
          icon: "success",
          title: "Kayıt Başarılı",
          text: "Jüriler başarıyla güncellendi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeJuryModal();
      } catch (error) {
        this.isLoading = false; // Spinner'ı kapat
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Jüriler güncellenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
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
    sort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortOrder = "asc";
      }
      this.currentPage = 1;
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

.search-container {
  padding: 10px 20px;
}

.sortable {
  cursor: pointer;
  position: relative;
}

.sortable:hover {
  background-color: #2b4ba1;
}

.sortable span {
  margin-left: 5px;
  font-size: 0.8rem;
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

th {
  padding: 12px;
  text-align: left;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

td {
  padding: 12px;
  text-align: left;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 600;
}

th:nth-child(1),
td:nth-child(1) {
  width: 10%;
}
th:nth-child(2),
td:nth-child(2) {
  width: 10%;
}
th:nth-child(3),
td:nth-child(3) {
  width: 25%;
}
th:nth-child(4),
td:nth-child(4) {
  width: 20%;
}
th:nth-child(5),
td:nth-child(5) {
  width: 20%;
}
th:nth-child(6),
td:nth-child(6) {
  width: 25%;
}

.table-hover tbody tr:hover {
  background-color: #f1f5f9;
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

.btn-primary {
  background-color: #60a5fa;
  border: none;
  color: #fff;
}
.btn-primary:hover {
  background-color: #3b82f6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-success {
  background-color: #6ee7b7;
  color: #fff;
  border: none;
}
.btn-success:hover {
  background-color: #10b981;
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
}
.btn-secondary:hover {
  background-color: #cbd5e1;
  color: #334155;
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

.btn-info {
  background-color: #7dd3fc;
  color: #fff;
  border: none;
}
.btn-info:hover {
  background-color: #0ea5e9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-outline-primary {
  background-color: #fff;
  color: #60a5fa;
  border: 1px solid #60a5fa;
  padding: 6px 12px;
  font-size: 0.85rem;
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

.form-control[readonly] {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
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
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.jury-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}
.jury-item:last-child {
  border-bottom: none;
}

.form-check-input {
  margin-right: 12px;
}

.form-check-label {
  color: #1e3a8a;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.4;
}
.jury-item:hover {
  background-color: #f1f5f9;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}

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
  color: #1e3a8a;
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
  th,
  td {
    padding: 8px;
    font-size: 0.75rem;
  }
  .modal-content {
    width: 90%;
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
}
</style>
