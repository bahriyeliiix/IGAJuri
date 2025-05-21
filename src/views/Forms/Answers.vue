<template>
  <div class="container">
    <!-- Cevap Grupları Kartı -->
    <div class="card mb-4">
      <div class="card-header">
        <button
          v-if="userRole === 1"
          class="btn btn-primary btn-sm"
          @click="openAddModal"
        >
          Yeni Cevap Grubu Ekle
        </button>
        <!-- Arama Alanı -->
        <div class="search-container mt-3">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Grup Adı veya Oluşturulma Tarihi ile Ara..."
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
                <th class="sortable" @click="sort('name')">
                  Grup Adı
                  <span v-if="sortKey === 'name'">
                    {{ sortOrder === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
                <th class="sortable" @click="sort('createdAt')">
                  Oluşturulma Tarihi
                  <span v-if="sortKey === 'createdAt'">
                    {{ sortOrder === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
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
                <td>{{ item.name }}</td>
                <td>{{ formatDate(item.createdAt) }}</td>
                <td class="action-buttons">
                  <template v-if="userRole === 1">
                    <button
                      class="btn btn-dark btn-sm mx-1"
                      @click="openOptionsModal(item)"
                    >
                      Seçenekler
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
    <!-- Yeni Cevap Grubu Ekle Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content">
        <h5>Yeni Cevap Grubu Ekle</h5>
        <div class="form-group">
          <label>Grup Adı <span class="required">*</span></label>
          <input
            v-model="newGroupName"
            type="text"
            class="form-control mb-3"
            :class="{ 'is-invalid': addFormErrors.groupName }"
            placeholder="Grup Adı"
            required
            @input="validateAddForm"
          />
          <div v-if="addFormErrors.groupName" class="invalid-feedback">
            Grup adı zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Açıklama</label>
          <textarea
            v-model="newGroupDescription"
            class="form-control mb-3"
            placeholder="Açıklama"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="saveNewGroup"
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
    <!-- Cevap Grubu Düzenle Modal -->
    <div
      v-if="showEditModal"
      class="modal-overlay"
      @click.self="closeEditModal"
    >
      <div class="modal-content">
        <h5>Cevap Grubu Düzenle (ID: {{ selectedGroup.id }})</h5>
        <div class="form-group">
          <label>Grup Adı <span class="required">*</span></label>
          <input
            v-model="editGroupName"
            type="text"
            class="form-control mb-3"
            :class="{ 'is-invalid': editFormErrors.groupName }"
            placeholder="Grup Adı"
            required
            @input="validateEditForm"
          />
          <div v-if="editFormErrors.groupName" class="invalid-feedback">
            Grup adı zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Açıklama</label>
          <textarea
            v-model="editGroupDescription"
            class="form-control mb-3"
            placeholder="Açıklama"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="saveEditGroup"
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
    <!-- Cevap Seçenekleri Modal -->
    <div
      v-if="showOptionsModal"
      class="modal-overlay"
      @click.self="closeOptionsModal"
    >
      <div class="modal-content" style="width: 700px; max-width: 95%">
        <h5>Seçenekler (Grup: {{ selectedGroup.name }})</h5>
        <button class="btn btn-primary btn-sm mb-3" @click="openAddOptionModal">
          Yeni Seçenek Ekle
        </button>
        <div class="table-responsive">
          <table class="table table-hover align-items-center mb-0">
            <thead class="thead-dark">
              <tr>
                <th>Sıra</th>
                <th>Metin</th>
                <th>Resim</th>
                <th>Değer</th>
                <th>Sıra No</th>
                <th>Varsayılan</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="selectedGroup.options.length === 0">
                <td colspan="7" class="text-center">
                  <span class="text-sm font-weight-bold"
                    >Seçenek bulunamadı</span
                  >
                </td>
              </tr>
              <tr
                v-else
                v-for="(option, index) in selectedGroup.options"
                :key="option.id"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ option.text }}</td>
                <td>
                  <img
                    v-if="option.imageUrl"
                    :src="option.imageUrl"
                    alt="Seçenek Resmi"
                    class="option-image"
                    @click="openImagePreview(option.imageUrl)"
                  />
                  <span v-else>-</span>
                </td>
                <td>{{ option.value }}</td>
                <td>{{ option.order }}</td>
                <td>{{ option.isDefault ? "Evet" : "Hayır" }}</td>
                <td class="action-buttons">
                  <button
                    class="btn btn-warning btn-sm mx-1"
                    @click="openEditOptionModal(option)"
                  >
                    Düzenle
                  </button>
                  <button
                    class="btn btn-danger btn-sm mx-1"
                    @click="deleteOption(option.id)"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="closeOptionsModal">
            Kapat
          </button>
        </div>
      </div>
    </div>
    <!-- Yeni Seçenek Ekle Modal -->
    <div
      v-if="showAddOptionModal"
      class="modal-overlay"
      @click.self="closeAddOptionModal"
    >
      <div class="modal-content">
        <h5>Yeni Seçenek Ekle</h5>
        <div class="form-group">
          <label>Metin <span class="required">*</span></label>
          <input
            v-model="newOption.text"
            type="text"
            class="form-control mb-3"
            :class="{ 'is-invalid': addOptionErrors.text }"
            placeholder="Seçenek Metni"
            required
            @input="validateAddOptionForm"
          />
          <div v-if="addOptionErrors.text" class="invalid-feedback">
            Metin zorunludur
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
            v-if="newOption.imageUrl"
            :src="newOption.imageUrl"
            alt="Önizleme"
            class="image-preview"
          />
        </div>
        <div class="form-group">
          <label>Değer <span class="required">*</span></label>
          <input
            v-model.number="newOption.value"
            type="number"
            class="form-control mb-3"
            :class="{ 'is-invalid': addOptionErrors.value }"
            placeholder="Değer"
            required
            @input="validateAddOptionForm"
          />
          <div v-if="addOptionErrors.value" class="invalid-feedback">
            Değer zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Sıra No <span class="required">*</span></label>
          <input
            v-model.number="newOption.order"
            type="number"
            class="form-control mb-3"
            :class="{ 'is-invalid': addOptionErrors.order }"
            placeholder="Sıra No"
            required
            @input="validateAddOptionForm"
          />
          <div v-if="addOptionErrors.order" class="invalid-feedback">
            Sıra no zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>
            <input
              v-model="newOption.isDefault"
              type="checkbox"
              class="form-check-input"
            />
            Varsayılan Seçenek
          </label>
        </div>
        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="saveNewOption"
            :disabled="!isAddOptionFormValid"
          >
            Kaydet
          </button>
          <button class="btn btn-secondary" @click="closeAddOptionModal">
            Kapat
          </button>
        </div>
      </div>
    </div>
    <!-- Seçenek Düzenle Modal -->
    <div
      v-if="showEditOptionModal"
      class="modal-overlay"
      @click.self="closeEditOptionModal"
    >
      <div class="modal-content">
        <h5>Seçenek Düzenle (ID: {{ editOption.id }})</h5>
        <div class="form-group">
          <label>Metin <span class="required">*</span></label>
          <input
            v-model="editOption.text"
            type="text"
            class="form-control mb-3"
            :class="{ 'is-invalid': editOptionErrors.text }"
            placeholder="Seçenek Metni"
            required
            @input="validateEditOptionForm"
          />
          <div v-if="editOptionErrors.text" class="invalid-feedback">
            Metin zorunludur
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
            v-if="editOption.imageUrl"
            :src="editOption.imageUrl"
            alt="Önizleme"
            class="image-preview"
          />
        </div>
        <div class="form-group">
          <label>Değer <span class="required">*</span></label>
          <input
            v-model.number="editOption.value"
            type="number"
            class="form-control mb-3"
            :class="{ 'is-invalid': editOptionErrors.value }"
            placeholder="Değer"
            required
            @input="validateEditOptionForm"
          />
          <div v-if="editOptionErrors.value" class="invalid-feedback">
            Değer zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Sıra No <span class="required">*</span></label>
          <input
            v-model.number="editOption.order"
            type="number"
            class="form-control mb-3"
            :class="{ 'is-invalid': editOptionErrors.order }"
            placeholder="Sıra No"
            required
            @input="validateEditOptionForm"
          />
          <div v-if="editOptionErrors.order" class="invalid-feedback">
            Sıra no zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>
            <input
              v-model="editOption.isDefault"
              type="checkbox"
              class="form-check-input"
            />
            Varsayılan Seçenek
          </label>
        </div>
        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="saveEditOption"
            :disabled="!isEditOptionFormValid"
          >
            Kaydet
          </button>
          <button class="btn btn-secondary" @click="closeEditOptionModal">
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
        <p>Cevap grubu ID {{ deleteGroupId }} silinsin mi?</p>
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
import { format } from "date-fns";
import Swal from "sweetalert2";
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
      showAddModal: false,
      showEditModal: false,
      showOptionsModal: false,
      showAddOptionModal: false,
      showEditOptionModal: false,
      showDeleteModal: false,
      showImagePreview: false,
      newGroupName: "",
      newGroupDescription: "",
      editGroupName: "",
      editGroupDescription: "",
      selectedGroup: {},
      deleteGroupId: null,
      previewImageUrl: "",
      addFormErrors: { groupName: false },
      editFormErrors: { groupName: false },
      isAddFormValid: false,
      isEditFormValid: false,
      newOption: {
        text: "",
        value: 0,
        order: 0,
        isDefault: false,
        imageUrl: "",
      },
      editOption: {},
      addOptionErrors: { text: false, value: false, order: false },
      editOptionErrors: { text: false, value: false, order: false },
      isAddOptionFormValid: false,
      isEditOptionFormValid: false,
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
            item.name.toLowerCase().includes(query) ||
            this.formatDate(item.createdAt).toLowerCase().includes(query)
        );
      }
      if (this.sortKey) {
        filtered.sort((a, b) => {
          let valueA = a[this.sortKey];
          let valueB = b[this.sortKey];
          if (this.sortKey === "createdAt") {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
          } else {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
          }
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
    formatDate(date) {
      if (!date) return "";
      try {
        return format(new Date(date), "dd-MM-yyyy");
      } catch {
        return date.split("T")[0];
      }
    },
    fetchUserRole() {
      this.userRole = parseInt(localStorage.getItem("role"), 10) || null;
    },
    async fetchGroups() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://localhost:7263/api/AnswerOptionGroup/GetAllAnswerOptionGroups",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.apiData = (response.data.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          createdAt:
            item.createdAt?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          options: item.options || [],
          isDeleted: item.isDeleted || false,
        }));
        this.noDataMessage = this.apiData.length === 0 ? "Veri yok" : "";
      } catch (error) {
        console.error("Cevap grupları çekerken hata:", error);
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
          "https://localhost:7263/api/AnswerPool/UploadImage",
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
          this.newOption.imageUrl = imageUrl;
        } else {
          this.editOption.imageUrl = imageUrl;
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
      this.addFormErrors = { groupName: !this.newGroupName.trim() };
      this.isAddFormValid = !Object.values(this.addFormErrors).some(
        (error) => error
      );
    },
    validateEditForm() {
      this.editFormErrors = { groupName: !this.editGroupName.trim() };
      this.isEditFormValid = !Object.values(this.editFormErrors).some(
        (error) => error
      );
    },
    validateAddOptionForm() {
      this.addOptionErrors = {
        text: !this.newOption.text.trim(),
        value: this.newOption.value === null || isNaN(this.newOption.value),
        order: this.newOption.order === null || isNaN(this.newOption.order),
      };
      this.isAddOptionFormValid = !Object.values(this.addOptionErrors).some(
        (error) => error
      );
    },
    validateEditOptionForm() {
      this.editOptionErrors = {
        text: !this.editOption.text.trim(),
        value: this.editOption.value === null || isNaN(this.editOption.value),
        order: this.editOption.order === null || isNaN(this.editOption.order),
      };
      this.isEditOptionFormValid = !Object.values(this.editOptionErrors).some(
        (error) => error
      );
    },
    async saveNewGroup() {
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
        const newGroup = {
          id: 0,
          isDeleted: false,
          name: this.newGroupName,
          description: this.newGroupDescription,
          createdAt: new Date().toISOString(),
        };
        const response = await axios.post(
          "https://localhost:7263/api/AnswerOptionGroup/CreateOrEditAnswerOptionGroup",
          newGroup,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.apiData.push({
          id: response.data.data.id,
          name: response.data.data.name,
          description: response.data.data.description || "",
          createdAt:
            response.data.data.createdAt?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          options: [],
          isDeleted: response.data.data.isDeleted || false,
        });
        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Kayıt Başarılı",
          text: "Yeni cevap grubu başarıyla kaydedildi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeAddModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Cevap grubu eklenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async saveEditGroup() {
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
        const updatedGroup = {
          id: this.selectedGroup.id,
          isDeleted: this.selectedGroup.isDeleted,
          name: this.editGroupName,
          description: this.editGroupDescription,
          createdAt: this.selectedGroup.createdAt,
        };
        await axios.post(
          "https://localhost:7263/api/AnswerOptionGroup/CreateOrEditAnswerOptionGroup",
          updatedGroup,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Object.assign(this.selectedGroup, {
          name: this.editGroupName,
          description: this.editGroupDescription,
        });
        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Güncelleme Başarılı",
          text: "Cevap grubu başarıyla güncellendi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeEditModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Cevap grubu güncellenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async saveNewOption() {
      this.validateAddOptionForm();
      if (!this.isAddOptionFormValid) return;
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
        const newOption = {
          id: 0,
          answerOptionGroupId: this.selectedGroup.id,
          text: this.newOption.text,
          value: this.newOption.value,
          order: this.newOption.order,
          isDefault: this.newOption.isDefault,
          imageUrl: this.newOption.imageUrl || null,
          isDeleted: false,
        };
        const response = await axios.post(
          "https://localhost:7263/api/AnswerPool/CreateOrEditAnswerPool",
          newOption,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.selectedGroup.options.push({
          id: response.data.data.id,
          text: response.data.data.text,
          value: response.data.data.value,
          order: response.data.data.order,
          isDefault: response.data.data.isDefault,
          imageUrl: response.data.data.imageUrl || null,
          isDeleted: response.data.data.isDeleted || false,
        });
        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Kayıt Başarılı",
          text: "Yeni seçenek başarıyla kaydedildi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeAddOptionModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Seçenek eklenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async saveEditOption() {
      this.validateEditOptionForm();
      if (!this.isEditOptionFormValid) return;
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
        const updatedOption = {
          id: this.editOption.id,
          answerOptionGroupId: this.selectedGroup.id,
          text: this.editOption.text,
          value: this.editOption.value,
          order: this.editOption.order,
          isDefault: this.editOption.isDefault,
          imageUrl: this.editOption.imageUrl || null,
          isDeleted: this.editOption.isDeleted,
        };
        await axios.post(
          "https://localhost:7263/api/AnswerPool/CreateOrEditAnswerPool",
          updatedOption,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const option = this.selectedGroup.options.find(
          (opt) => opt.id === this.editOption.id
        );
        Object.assign(option, {
          text: this.editOption.text,
          value: this.editOption.value,
          order: this.editOption.order,
          isDefault: this.editOption.isDefault,
          imageUrl: this.editOption.imageUrl || null,
        });
        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Güncelleme Başarılı",
          text: "Seçenek başarıyla güncellendi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeEditOptionModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Seçenek güncellenirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async deleteOption(id) {
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
          `https://localhost:7263/api/AnswerPool/DeleteAnswerPool/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.selectedGroup.options = this.selectedGroup.options.filter(
          (opt) => opt.id !== id
        );
        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Silme Başarılı",
          text: "Seçenek başarıyla silindi!",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Seçenek silinirken hata oluştu: ${error.response?.data?.message || error.message}`,
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
          `https://localhost:7263/api/AnsAnswerOptionGroupwer/DeleteAnswerOptionGroup/${this.deleteGroupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.apiData = this.apiData.filter(
          (item) => item.id !== this.deleteGroupId
        );
        this.isLoading = false;
        Swal.fire({
          icon: "success",
          title: "Silme Başarılı",
          text: "Cevap grubu başarıyla silindi!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeDeleteModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Cevap grubu silinirken hata oluştu: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        this.isLoading = false;
      }
    },
    openAddModal() {
      this.newGroupName = "";
      this.newGroupDescription = "";
      this.addFormErrors = { groupName: false };
      this.isAddFormValid = false;
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    openEditModal(group) {
      this.selectedGroup = group;
      this.editGroupName = group.name;
      this.editGroupDescription = group.description;
      this.editFormErrors = { groupName: false };
      this.isEditFormValid = true;
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    openOptionsModal(group) {
      this.selectedGroup = group;
      this.showOptionsModal = true;
    },
    closeOptionsModal() {
      this.showOptionsModal = false;
    },
    openAddOptionModal() {
      this.newOption = {
        text: "",
        value: 0,
        order: 0,
        isDefault: false,
        imageUrl: "",
      };
      this.addOptionErrors = { text: false, value: false, order: false };
      this.isAddOptionFormValid = false;
      this.showAddOptionModal = true;
    },
    closeAddOptionModal() {
      this.showAddOptionModal = false;
    },
    openEditOptionModal(option) {
      this.editOption = { ...option };
      this.editOptionErrors = { text: false, value: false, order: false };
      this.isEditOptionFormValid = true;
      this.showEditOptionModal = true;
    },
    closeEditOptionModal() {
      this.showEditOptionModal = false;
    },
    openDeleteModal(id) {
      this.deleteGroupId = id;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
    },
  },
  mounted() {
    this.fetchUserRole();
    this.fetchGroups();
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
  width: 30%;
}
th:nth-child(4),
td:nth-child(4) {
  width: 20%;
}
th:nth-child(5),
td:nth-child(5) {
  width: 30%;
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
.btn-dark {
  background-color: #334155;
  color: #fff;
  border: none;
}
.btn-dark:hover {
  background-color: #1e293b;
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
.option-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
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
