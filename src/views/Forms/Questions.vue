<template>
  <div class="container">
    <!-- Soru Havuzu Kartı -->
    <div class="card mb-4">
      <div class="card-header">
        <button
          v-if="userRole === 1"
          class="btn btn-primary btn-sm"
          @click="openAddModal"
        >
          Yeni Soru Ekle
        </button>
        <!-- Arama Alanı -->
        <div class="search-container mt-3">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Soru metni veya kodu ile ara..."
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
                <th class="sortable" @click="sort('text')">
                  Soru Metni
                  <span v-if="sortKey === 'text'">
                    {{ sortOrder === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
                <th class="sortable" @click="sort('questionType')">
                  Soru Tipi
                  <span v-if="sortKey === 'questionType'">
                    {{ sortOrder === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
                <th>Kod</th>
                <th>Tuzak</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedData.length === 0">
                <td colspan="7" class="text-center">
                  <span class="text-sm font-weight-bold">{{
                    noDataMessage
                  }}</span>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in paginatedData" :key="item.id">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ item.id }}</td>
                <td>{{ item.text }}</td>
                <td>{{ getQuestionTypeName(item.questionType) }}</td>
                <td>{{ item.code || "-" }}</td>
                <td>{{ item.isTrap ? "Evet" : "Hayır" }}</td>
                <td class="action-buttons">
                  <template v-if="userRole === 1">
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

    <!-- Yeni Soru Ekle Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content">
        <h5>Yeni Soru Ekle</h5>
        <div class="form-group">
          <label>Soru Metni <span class="required">*</span></label>
          <textarea
            v-model="newQuestion.text"
            class="form-control mb-3"
            :class="{ 'is-invalid': addFormErrors.text }"
            placeholder="Soru metni"
            required
            rows="3"
            @input="validateAddForm"
          ></textarea>
          <div v-if="addFormErrors.text" class="invalid-feedback">
            Soru metni zorunludur
          </div>
        </div>

        <div class="form-group">
          <label>Soru Tipi <span class="required">*</span></label>
          <select
            v-model="newQuestion.questionType"
            class="form-control mb-3"
            :class="{ 'is-invalid': addFormErrors.questionType }"
            required
            @change="validateAddForm"
          >
            <option value="">Seçiniz</option>
            <option
              v-for="type in questionTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.name }}
            </option>
          </select>
          <div v-if="addFormErrors.questionType" class="invalid-feedback">
            Soru tipi zorunludur
          </div>
        </div>

        <div class="form-group">
          <label>Resim</label>
          <input
            type="file"
            class="form-control mb-3"
            accept="image/*"
            @change="handleImageUpload($event, 'new')"
          />
          <img
            v-if="newQuestion.imageUrl"
            :src="newQuestion.imageUrl"
            alt="Önizleme"
            class="image-preview"
          />
        </div>

        <div class="form-group">
          <label>Kod</label>
          <input
            v-model="newQuestion.code"
            type="text"
            class="form-control mb-3"
            placeholder="Soru kodu"
          />
        </div>

        <div class="form-group">
          <label>
            <input
              v-model="newQuestion.isTrap"
              type="checkbox"
              class="form-check-input"
            />
            Tuzak Soru
          </label>
        </div>

        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="saveNewQuestion"
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

    <!-- Soru Düzenle Modal -->
    <div
      v-if="showEditModal"
      class="modal-overlay"
      @click.self="closeEditModal"
    >
      <div class="modal-content">
        <h5>Soru Düzenle (ID: {{ selectedQuestion.id }})</h5>
        <div class="form-group">
          <label>Soru Metni <span class="required">*</span></label>
          <textarea
            v-model="editQuestion.text"
            class="form-control mb-3"
            :class="{ 'is-invalid': editFormErrors.text }"
            placeholder="Soru metni"
            required
            rows="3"
            @input="validateEditForm"
          ></textarea>
          <div v-if="editFormErrors.text" class="invalid-feedback">
            Soru metni zorunludur
          </div>
        </div>

        <div class="form-group">
          <label>Soru Tipi <span class="required">*</span></label>
          <select
            v-model="editQuestion.questionType"
            class="form-control mb-3"
            :class="{ 'is-invalid': editFormErrors.questionType }"
            required
            @change="validateEditForm"
          >
            <option value="">Seçiniz</option>
            <option
              v-for="type in questionTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.name }}
            </option>
          </select>
          <div v-if="editFormErrors.questionType" class="invalid-feedback">
            Soru tipi zorunludur
          </div>
        </div>

        <div class="form-group">
          <label>Resim</label>
          <input
            type="file"
            class="form-control mb-3"
            accept="image/*"
            @change="handleImageUpload($event, 'edit')"
          />
          <img
            v-if="editQuestion.imageUrl"
            :src="editQuestion.imageUrl"
            alt="Önizleme"
            class="image-preview"
          />
        </div>

        <div class="form-group">
          <label>Kod</label>
          <input
            v-model="editQuestion.code"
            type="text"
            class="form-control mb-3"
            placeholder="Soru kodu"
          />
        </div>

        <div class="form-group">
          <label>
            <input
              v-model="editQuestion.isTrap"
              type="checkbox"
              class="form-check-input"
            />
            Tuzak Soru
          </label>
        </div>

        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="saveEditQuestion"
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

    <!-- Silme Onayı Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="closeDeleteModal"
    >
      <div class="modal-content">
        <h5>Silme Onayı</h5>
        <p>Soru ID {{ deleteQuestionId }} silinsin mi?</p>
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

    <!-- Resim Önizleme Modal -->
    <div
      v-if="showImagePreview"
      class="modal-overlay"
      @click.self="closeImagePreview"
    >
      <div class="modal-content image-preview-modal">
        <img
          :src="`https://localhost:7263/img/${previewImageUrl}`"
          alt="Resim Önizleme"
          class="full-image"
        />
        <button class="btn btn-secondary mt-3" @click="closeImagePreview">
          Kapat
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

// Soru tipleri enum değerleri
const QuestionType = {
  Text: 0,
  MultipleChoice: 1,
  SingleChoice: 2,
  File: 3,
  Date: 4,
};

export default {
  data() {
    return {
      apiData: [],
      noDataMessage: "Veri yükleniyor...",
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      sortKey: "",
      sortOrder: "asc",
      userRole: null,

      // Modal durumları
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showImagePreview: false,

      // Yeni soru formu
      newQuestion: {
        text: "",
        questionType: "",
        isTrap: false,
        imageUrl: "",
        code: "",
      },

      // Düzenleme formu
      editQuestion: {},
      selectedQuestion: {},
      deleteQuestionId: null,
      previewImageUrl: "",

      // Form validasyon hataları
      addFormErrors: {
        text: false,
        questionType: false,
      },
      editFormErrors: {
        text: false,
        questionType: false,
      },

      // Form geçerlilik durumu
      isAddFormValid: false,
      isEditFormValid: false,

      // Soru tipleri
      questionTypes: [
        { value: QuestionType.Text, name: "Metin" },
        { value: QuestionType.MultipleChoice, name: "Çoklu Seçim" },
        { value: QuestionType.SingleChoice, name: "Tekli Seçim" },
        { value: QuestionType.File, name: "Dosya" },
        { value: QuestionType.Date, name: "Tarih" },
      ],

      isLoading: false,
    };
  },
  computed: {
    filteredData() {
      let filtered = [...this.apiData];
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.text.toLowerCase().includes(query) ||
            (item.code && item.code.toLowerCase().includes(query))
        );
      }
      if (this.sortKey) {
        filtered.sort((a, b) => {
          let valueA = a[this.sortKey];
          let valueB = b[this.sortKey];

          if (this.sortKey === "questionType") {
            valueA = this.getQuestionTypeName(valueA);
            valueB = this.getQuestionTypeName(valueB);
          }

          valueA = typeof valueA === "string" ? valueA.toLowerCase() : valueA;
          valueB = typeof valueB === "string" ? valueB.toLowerCase() : valueB;

          return this.sortOrder === "asc"
            ? valueA > valueB
              ? 1
              : -1
            : valueA < valueB
              ? 1
              : -1;
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
    getQuestionTypeName(type) {
      const found = this.questionTypes.find((t) => t.value === type);
      return found ? found.name : "Bilinmeyen";
    },

    fetchUserRole() {
      this.userRole = parseInt(localStorage.getItem("role"), 10) || null;
    },

    async fetchQuestions() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://localhost:7263/api/QuestionPool/GetAllQuestionPools",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.apiData = response.data.data || [];
        this.noDataMessage = this.apiData.length === 0 ? "Veri yok" : "";
      } catch (error) {
        console.error("Sorular çekerken hata:", error);
        this.noDataMessage = "Veri çekilirken hata oluştu";
      }
    },

    async handleImageUpload(event, type) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "https://localhost:7263/api/QuestionPool/UploadImage",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const imageUrl = response.data.data.fileName;
        if (type === "new") {
          this.newQuestion.imageUrl = imageUrl;
        } else {
          this.editQuestion.imageUrl = imageUrl;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Resim yüklenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      }
    },

    openImagePreview(url) {
      this.previewImageUrl = url;
      this.showImagePreview = true;
    },

    closeImagePreview() {
      this.showImagePreview = false;
      this.previewImageUrl = "";
    },

    validateAddForm() {
      this.addFormErrors = {
        text: !this.newQuestion.text.trim(),
        questionType: !this.newQuestion.questionType,
      };
      this.isAddFormValid = !Object.values(this.addFormErrors).some(
        (error) => error
      );
    },

    validateEditForm() {
      this.editFormErrors = {
        text: !this.editQuestion.text.trim(),
        questionType: !this.editQuestion.questionType,
      };
      this.isEditFormValid = !Object.values(this.editFormErrors).some(
        (error) => error
      );
    },

    async saveNewQuestion() {
      this.validateAddForm();
      if (!this.isAddFormValid) return;

      this.isLoading = true;
      Swal.fire({
        title: "Kaydediliyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const token = localStorage.getItem("token");
        const newQuestion = {
          text: this.newQuestion.text,
          questionType: parseInt(this.newQuestion.questionType),
          isTrap: this.newQuestion.isTrap,
          imageUrl: this.newQuestion.imageUrl || null,
          code: this.newQuestion.code || null,
        };

        const response = await axios.post(
          "https://localhost:7263/api/QuestionPool/CreateOrEditQuestionPool",
          newQuestion,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.apiData.push(response.data.data);
        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Kayıt Başarılı",
          text: "Yeni soru başarıyla kaydedildi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeAddModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Soru eklenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        this.isLoading = false;
      }
    },

    async saveEditQuestion() {
      this.validateEditForm();
      if (!this.isEditFormValid) return;

      this.isLoading = true;
      Swal.fire({
        title: "Güncelleniyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const token = localStorage.getItem("token");
        const updatedQuestion = {
          id: this.selectedQuestion.id,
          text: this.editQuestion.text,
          questionType: parseInt(this.editQuestion.questionType),
          isTrap: this.editQuestion.isTrap,
          imageUrl: this.editQuestion.imageUrl || null,
          code: this.editQuestion.code || null,
          isDeleted: this.selectedQuestion.isDeleted || false,
        };

        await axios.post(
          "https://localhost:7263/api/QuestionPool/CreateOrEditQuestionPool",
          updatedQuestion,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Object.assign(this.selectedQuestion, {
          text: this.editQuestion.text,
          questionType: parseInt(this.editQuestion.questionType),
          isTrap: this.editQuestion.isTrap,
          imageUrl: this.editQuestion.imageUrl || null,
          code: this.editQuestion.code || null,
        });

        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Güncelleme Başarılı",
          text: "Soru başarıyla güncellendi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeEditModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Soru güncellenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        this.isLoading = false;
      }
    },

    async confirmDelete() {
      this.isLoading = true;
      Swal.fire({
        title: "Siliniyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://localhost:7263/api/QuestionPool/DeleteQuestionPool/${this.deleteQuestionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.apiData = this.apiData.filter(
          (item) => item.id !== this.deleteQuestionId
        );

        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Silme Başarılı",
          text: "Soru başarıyla silindi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeDeleteModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Soru silinirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Modal işlemleri
    openAddModal() {
      this.newQuestion = {
        text: "",
        questionType: "",
        isTrap: false,
        imageUrl: "",
        code: "",
      };
      this.addFormErrors = { text: false, questionType: false };
      this.isAddFormValid = false;
      this.showAddModal = true;
    },

    closeAddModal() {
      this.showAddModal = false;
    },

    openEditModal(question) {
      this.selectedQuestion = question;
      this.editQuestion = { ...question };
      this.editFormErrors = { text: false, questionType: false };
      this.isEditFormValid = true;
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
    },

    openDeleteModal(id) {
      this.deleteQuestionId = id;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
    },

    // Sayfalama işlemleri
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    goToPage(page) {
      this.currentPage = page;
    },

    sort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortOrder = "asc";
      }
    },
  },
  mounted() {
    this.fetchUserRole();
    this.fetchQuestions();
  },
};
</script>

<style scoped>
/* Önceki bileşendeki stil kurallarını buraya ekleyebilirsiniz */
/* Aynı stil yapısını koruyoruz */
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
  width: 500px;
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
.form-check-input {
  margin-right: 12px;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}
.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-top: 10px;
}
.image-preview-modal {
  width: 90%;
  max-width: 800px;
  text-align: center;
}
.full-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
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
