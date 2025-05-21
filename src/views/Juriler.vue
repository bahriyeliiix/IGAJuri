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
                <th class="text-uppercase text-light text-xs font-weight-bolder">
                  Sıra No
                </th>
                <th class="text-uppercase text-light text-xs font-weight-bolder">
                  Id
                </th>
                <th class="text-uppercase text-light text-xs font-weight-bolder">
                  Jüri Adı Soyadı
                </th>
                <th class="text-uppercase text-light text-xs font-weight-bolder">
                  Oluşturulma Tarihi
                </th>
                <th class="text-uppercase text-light text-xs font-weight-bolder">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedData.length === 0">
                <td colspan="5" class="text-center">
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
                  <span class="text-xs font-weight-bold">{{ item.id }}</span>
                </td>
                <td>
                  <span class="text-xs font-weight-bold">{{
                    item.juryFullName
                  }}</span>
                </td>
                <td>
                  <span class="text-xs font-weight-bold">{{
                    item.createdDate
                  }}</span>
                </td>
                <td class="action-buttons">
                  <button
                    class="btn btn-dark btn-sm mx-1"
                    @click="openDetailsModal(item)"
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

      <!-- Modallar -->
      <div
        v-if="showAddModal"
        class="modal-overlay"
        @click.self="closeAddModal"
      >
        <div class="modal-content">
          <h5>Yeni Jüri Ekle</h5>
          <input
            v-model="newJuryFullName"
            type="text"
            class="form-control mb-3"
            placeholder="İsim Soyisim"
          />
          <input
            v-model="newJuryEmail"
            type="email"
            class="form-control mb-3"
            placeholder="E-posta"
          />
          <div class="input-group mb-3">
            <input
              v-model="newJuryPassword"
              type="text"
              class="form-control"
              placeholder="Şifre"
            />
            <div class="input-group-append">
              <button
                class="btn btn-outline-secondary"
                @click="generatePassword"
              >
                Şifre Üret
              </button>
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveNewJury">Kaydet</button>
            <button class="btn btn-secondary" @click="closeAddModal">
              Kapat
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showDetailsModal"
        class="modal-overlay"
        @click.self="closeDetailsModal"
      >
        <div class="modal-content">
          <h5>Jüri Detayları (ID: {{ selectedJury.id }})</h5>
          <div class="details-content">
            <p><strong>Ad Soyad:</strong> {{ selectedJury.juryFullName }}</p>
            <p>
              <strong>E-posta:</strong>
              {{ selectedJury.email || "Belirtilmemiş" }}
            </p>
            <p>
              <strong>Oluşturulma Tarihi:</strong>
              {{ selectedJury.createdDate }}
            </p>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-secondary" @click="closeDetailsModal">
              Kapat
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal-content">
          <h5>Jüri Düzenle (ID: {{ selectedJury.id }})</h5>
          <input
            v-model="editJuryFullName"
            type="text"
            class="form-control mb-3"
            placeholder="İsim Soyisim"
          />
          <input
            v-model="editJuryEmail"
            type="email"
            class="form-control mb-3"
            placeholder="E-posta"
          />
          <div class="input-group mb-3">
            <input
              v-model="editJuryPassword"
              type="text"
              class="form-control"
              placeholder="Yeni Şifre (isteğe bağlı)"
              :disabled="!resetPassword"
            />
            <div class="input-group-append">
              <button
                class="btn btn-outline-secondary"
                @click="toggleResetPassword"
              >
                {{ resetPassword ? "İptal" : "Şifreyi Sıfırla" }}
              </button>
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveEditJury">
              Kaydet
            </button>
            <button class="btn btn-secondary" @click="closeEditModal">
              Kapat
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="closeDeleteModal"
      >
        <div class="modal-content">
          <h5>Silme Onayı</h5>
          <p>Jüri ID {{ deleteJuryId }} silinsin mi?</p>
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
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "Juriler",
  data() {
    return {
      apiData: [],
      baseUrl: "https://localhost:7263",
      token: null,
      noDataMessage: "",
      currentPage: 1,
      itemsPerPage: 10,
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showDetailsModal: false,
      newJuryFullName: "",
      newJuryEmail: "",
      newJuryPassword: "",
      editJuryFullName: "",
      editJuryEmail: "",
      editJuryPassword: "",
      resetPassword: false,
      selectedJury: {},
      deleteJuryId: null,
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
  mounted() {
    this.token = localStorage.getItem("token");
    if (!this.token) {
      console.error("Token bulunamadı, lütfen giriş yapın.");
      this.noDataMessage = "Oturum açmanız gerekiyor.";
      return;
    }
    this.fetchJuryList();
  },
  methods: {
    async fetchJuryList() {
      try {
        const response = await fetch(`${this.baseUrl}/api/User/GetAllJurry`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.statusCode === 200) {
          this.apiData = result.data.map((item) => ({
            id: item.id,
            juryFullName: item.username,
            email: item.email,
            createdDate:
              item.createdDate || new Date().toISOString().split("T")[0],
          }));
        } else {
          this.noDataMessage = "Jüri listesi yüklenemedi.";
        }
      } catch (error) {
        console.error("Hata:", error);
        this.noDataMessage = "Bir hata oluştu.";
      }
    },

    generatePassword() {
      const length = 10;
      const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
      let password = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      this.newJuryPassword = password;
    },

    toggleResetPassword() {
      if (this.resetPassword) {
        this.editJuryPassword = "";
      } else {
        const length = 10;
        const charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let password = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset[randomIndex];
        }
        this.editJuryPassword = password;
      }
      this.resetPassword = !this.resetPassword;
    },

    async saveNewJury() {
      if (!this.newJuryFullName.trim() || !this.newJuryEmail.trim() || !this.newJuryPassword.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Eksik Bilgi",
          text: "Tüm alanlar doldurulmalıdır!",
        });
        return;
      }

      Swal.fire({
        title: "Kaydediliyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const payload = {
        username: this.newJuryFullName,
        email: this.newJuryEmail,
        password: this.newJuryPassword,
        role: 2,
      };

      try {
        const response = await fetch(`${this.baseUrl}/api/User/CreateOrEditUser`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (result.statusCode === 200) {
          this.apiData.push({
            id: result.data.id,
            juryFullName: this.newJuryFullName,
            email: this.newJuryEmail,
            createdDate: new Date().toISOString().split("T")[0],
          });

          Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Yeni jüri başarıyla kaydedildi!",
            timer: 2000,
            showConfirmButton: false,
          });
          this.closeAddModal();
        } else {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Jüri eklenemedi!",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Jüri eklenirken hata oluştu: ${error.message}`,
        });
      }
    },

    async saveEditJury() {
      if (!this.editJuryFullName.trim() || !this.editJuryEmail.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Eksik Bilgi",
          text: "Tüm alanlar doldurulmalıdır!",
        });
        return;
      }

      Swal.fire({
        title: "Güncelleniyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const payload = {
        id: this.selectedJury.id,
        username: this.editJuryFullName,
        email: this.editJuryEmail,
        role: 2,
      };
      if (this.resetPassword && this.editJuryPassword.trim()) {
        payload.password = this.editJuryPassword;
      }

      try {
        const response = await fetch(`${this.baseUrl}/api/User/CreateOrEditUser`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (result.statusCode === 200) {
          this.selectedJury.juryFullName = this.editJuryFullName;
          this.selectedJury.email = this.editJuryEmail;

          Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Jüri başarıyla güncellendi!",
            timer: 2000,
            showConfirmButton: false,
          });
          this.closeEditModal();
        } else {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Jüri güncellenemedi!",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Güncelleme sırasında hata oluştu: ${error.message}`,
        });
      }
    },

    async confirmDelete() {
      Swal.fire({
        title: "Siliniyor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch(`${this.baseUrl}/api/User/DeleteUser/${this.deleteJuryId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        if (result.statusCode === 200) {
          this.apiData = this.apiData.filter((item) => item.id !== this.deleteJuryId);

          Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Jüri başarıyla silindi!",
            timer: 2000,
            showConfirmButton: false,
          });
          this.closeDeleteModal();
        } else {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Jüri silinemedi!",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: `Silme sırasında hata oluştu: ${error.message}`,
        });
      }
    },

    openAddModal() {
      this.newJuryFullName = "";
      this.newJuryEmail = "";
      this.newJuryPassword = "";
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    openDetailsModal(jury) {
      this.selectedJury = jury;
      this.showDetailsModal = true;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
    },
    openEditModal(jury) {
      this.selectedJury = jury;
      this.editJuryFullName = jury.juryFullName;
      this.editJuryEmail = jury.email;
      this.editJuryPassword = "";
      this.resetPassword = false;
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    openDeleteModal(id) {
      this.deleteJuryId = id;
      Swal.fire({
        title: "Silmek istediğinizden emin misiniz?",
        text: `Jüri ID ${id} silinecek!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Evet, Sil!",
        cancelButtonText: "Hayır",
      }).then((result) => {
        if (result.isConfirmed) {
          this.confirmDelete();
        }
      });
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
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
  .table th:nth-child(3),
  .table td:nth-child(3) {
    width: 35%;
  }
  .table th:nth-child(5),
  .table td:nth-child(5) {
    width: 35%;
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