<template>
  <div class="container">
    <div class="card mb-4">
      <div class="card-header">
        <button class="btn btn-primary btn-sm" @click="toggleAddForm">
          Yeni Çekiliş Ekle
        </button>
      </div>
      <div class="search-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control search-input"
          placeholder="Çekiliş adı, ödül veya açıklama ile ara..."
        />
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-items-center mb-0">
            <thead class="thead-dark">
              <tr>
                <th class="sira-th text-center">Sıra No</th>
                <th class="text-center">Id</th>
                <th>Çekiliş Adı</th>
                <th>Oluşturulma Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedData.length === 0">
                <td colspan="5" class="text-center">
                  <span class="text-sm font-weight-bold">
                    {{ noDataMessage || "Veri yok" }}
                  </span>
                </td>
              </tr>
              <tr
                v-for="(raffle, index) in paginatedData"
                :key="raffle.id"
              >
                <td class="sira-td text-center">
                  <span class="sira-badge">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="text-xs font-weight-bold">{{ raffle.id }}</span>
                </td>
                <td>
                  <span class="text-xs font-weight-bold">{{ raffle.name }}</span>
                </td>
                <td>
                  <span class="text-xs font-weight-bold">
                    {{ formatDate(raffle.createdDate) }}
                  </span>
                </td>
                <td class="action-buttons">
                  <button class="btn btn-dark btn-sm mx-1" @click="openDetailsModal(raffle)">Detaylar</button>
                  <button class="btn btn-warning btn-sm mx-1" @click="openEditModal(raffle)">Düzenle</button>
                  <button class="btn btn-danger btn-sm mx-1" @click="openDeleteModal(raffle)">Sil</button>
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
          <span class="text-sm font-weight-bold">
            Toplam Veri: {{ filteredRaffles.length }}
          </span>
        </div>
      </div>

      <!-- YENİ ÇEKİLİŞ EKLEME MODAL DİKDÖRTGEN FORM -->
      <div v-if="showAddForm" class="modal-overlay" @click.self="toggleAddForm">
        <div class="modal-add-form">
          <h5>Yeni Çekiliş Ekle</h5>
          <input v-model="newRaffle.name" type="text" class="form-control mb-2" placeholder="Çekiliş Adı" />
          <input v-model="newRaffle.prizeName" type="text" class="form-control mb-2" placeholder="Ödül Adı" />
          <input v-model="newRaffle.startDate" type="datetime-local" class="form-control mb-2" />
          <input v-model="newRaffle.endDate" type="datetime-local" class="form-control mb-2" />
          <input v-model="newRaffle.description" type="text" class="form-control mb-2" placeholder="Açıklama (opsiyonel)" />
          <input v-model="newRaffle.prizeDescription" type="text" class="form-control mb-2" placeholder="Ödül Açıklaması (opsiyonel)" />
          <div class="form-actions">
            <button class="btn btn-success btn-sm" @click="saveNewRaffle">Kaydet</button>
            <button class="btn btn-secondary btn-sm" @click="toggleAddForm">Kapat</button>
          </div>
        </div>
      </div>

      <!-- Detay Modal -->
      <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
        <div class="modal-content">
          <h5>Çekiliş Detayları</h5>
          <p><strong>Adı:</strong> {{ selectedRaffle.name }}</p>
          <p><strong>Açıklama:</strong> {{ selectedRaffle.description || "Belirtilmemiş" }}</p>
          <p><strong>Başlangıç:</strong> {{ formatDateTime(selectedRaffle.startDate) }}</p>
          <p><strong>Bitiş:</strong> {{ formatDateTime(selectedRaffle.endDate) }}</p>
          <p><strong>Ödül Adı:</strong> {{ selectedRaffle.prizeName }}</p>
          <p><strong>Ödül Açıklaması:</strong> {{ selectedRaffle.prizeDescription || "Belirtilmemiş" }}</p>
          <p><strong>Oluşturulma Tarihi:</strong> {{ formatDate(selectedRaffle.createdDate) }}</p>
          <div class="modal-buttons">
            <button class="btn btn-secondary" @click="closeDetailsModal">Kapat</button>
          </div>
        </div>
      </div>
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
          <h5>Çekiliş Düzenle (ID: {{ editRaffle.id }})</h5>
          <input v-model="editRaffle.name" type="text" class="form-control mb-3" placeholder="Çekiliş Adı" />
          <textarea v-model="editRaffle.description" class="form-control mb-3" placeholder="Açıklama (opsiyonel)" rows="2"></textarea>
          <label class="form-label">Başlangıç Tarihi</label>
          <input v-model="editRaffle.startDate" type="datetime-local" class="form-control mb-3" />
          <label class="form-label">Bitiş Tarihi</label>
          <input v-model="editRaffle.endDate" type="datetime-local" class="form-control mb-3" />
          <input v-model="editRaffle.prizeName" type="text" class="form-control mb-3" placeholder="Ödül Adı" />
          <textarea v-model="editRaffle.prizeDescription" class="form-control mb-3" placeholder="Ödül Açıklaması (opsiyonel)" rows="2"></textarea>
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveEditRaffle">Kaydet</button>
            <button class="btn btn-secondary" @click="closeEditModal">Kapat</button>
          </div>
        </div>
      </div>
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-content">
          <h5>Silme Onayı</h5>
          <p>Çekiliş ID {{ selectedRaffle.id }} silinsin mi?</p>
          <div class="modal-buttons">
            <button class="btn btn-danger" @click="confirmDelete">Evet, Sil</button>
            <button class="btn btn-secondary" @click="closeDeleteModal">Hayır</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "Cekilisler",
  data() {
    return {
      raffles: [],
      baseUrl: "https://localhost:7263",
      token: null,
      noDataMessage: "",
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      showAddForm: false,
      showDetailsModal: false,
      showEditModal: false,
      showDeleteModal: false,
      newRaffle: {
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        prizeName: "",
        prizeDescription: "",
      },
      editRaffle: {},
      selectedRaffle: {},
    };
  },
  computed: {
    filteredRaffles() {
      if (!this.searchQuery.trim()) return this.raffles;
      const q = this.searchQuery.trim().toLowerCase();
      return this.raffles.filter((item) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.prizeName && item.prizeName.toLowerCase().includes(q)) ||
        (item.createdDate && this.formatDate(item.createdDate).toLowerCase().includes(q))
      );
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRaffles.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredRaffles.length / this.itemsPerPage) || 1;
    },
  },
  mounted() {
    this.token = localStorage.getItem("token");
    if (!this.token) {
      this.noDataMessage = "Oturum açmanız gerekiyor.";
      return;
    }
    this.fetchRaffles();
  },
  methods: {
    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      if (!this.showAddForm) {
        this.newRaffle = {
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          prizeName: "",
          prizeDescription: "",
        };
      }
    },
    async fetchRaffles() {
      try {
        const response = await fetch(`${this.baseUrl}/api/Raffle/GetAllRaffles`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.statusCode === 200) {
          this.raffles = result.data.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            startDate: item.startDate,
            endDate: item.endDate,
            prizeName: item.prizeName,
            prizeDescription: item.prizeDescription,
            createdDate: item.createdDate || item.startDate,
          }));
        } else {
          this.noDataMessage = "Çekiliş listesi yüklenemedi.";
        }
      } catch (error) {
        this.noDataMessage = "Bir hata oluştu.";
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "Belirtilmemiş";
      return new Date(dateStr).toLocaleDateString("tr-TR");
    },
    formatDateTime(dateStr) {
      if (!dateStr) return "Belirtilmemiş";
      return new Date(dateStr).toLocaleString("tr-TR");
    },
    async saveNewRaffle() {
      if (!this.newRaffle.name.trim() || !this.newRaffle.startDate || !this.newRaffle.endDate) {
        Swal.fire({
          icon: "warning",
          title: "Eksik Bilgi",
          text: "Çekiliş adı, başlangıç ve bitiş tarihi zorunludur!",
        });
        return;
      }
      if (new Date(this.newRaffle.endDate) <= new Date(this.newRaffle.startDate)) {
        Swal.fire({
          icon: "warning",
          title: "Geçersiz Tarih",
          text: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır!",
        });
        return;
      }
      Swal.fire({ title: "Kaydediliyor...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const payload = {
          name: this.newRaffle.name,
          description: this.newRaffle.description,
          startDate: new Date(this.newRaffle.startDate).toISOString(),
          endDate: new Date(this.newRaffle.endDate).toISOString(),
          prizeName: this.newRaffle.prizeName,
          prizeDescription: this.newRaffle.prizeDescription,
        };
        const response = await fetch(`${this.baseUrl}/api/Raffle/CreateOrEditRaffle`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.statusCode === 200) {
          Swal.fire({ icon: "success", title: "Başarılı", text: "Çekiliş başarıyla eklendi!", timer: 2000, showConfirmButton: false });
          this.toggleAddForm();
          this.fetchRaffles();
        } else {
          Swal.fire({ icon: "error", title: "Hata", text: result.message || "Çekiliş eklenemedi!" });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Hata", text: `Ekleme sırasında hata oluştu: ${error.message}` });
      }
    },
    openDetailsModal(raffle) {
      this.selectedRaffle = { ...raffle };
      this.showDetailsModal = true;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
    },
    openEditModal(raffle) {
      this.editRaffle = { ...raffle };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    async saveEditRaffle() {
      if (!this.editRaffle.name.trim() || !this.editRaffle.startDate || !this.editRaffle.endDate) {
        Swal.fire({
          icon: "warning",
          title: "Eksik Bilgi",
          text: "Çekiliş adı, başlangıç ve bitiş tarihi zorunludur!",
        });
        return;
      }
      if (new Date(this.editRaffle.endDate) <= new Date(this.editRaffle.startDate)) {
        Swal.fire({
          icon: "warning",
          title: "Geçersiz Tarih",
          text: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır!",
        });
        return;
      }
      Swal.fire({ title: "Güncelleniyor...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const payload = {
          id: this.editRaffle.id,
          name: this.editRaffle.name,
          description: this.editRaffle.description,
          startDate: new Date(this.editRaffle.startDate).toISOString(),
          endDate: new Date(this.editRaffle.endDate).toISOString(),
          prizeName: this.editRaffle.prizeName,
          prizeDescription: this.editRaffle.prizeDescription,
        };
        const response = await fetch(`${this.baseUrl}/api/Raffle/CreateOrEditRaffle`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.statusCode === 200) {
          Swal.fire({ icon: "success", title: "Başarılı", text: "Çekiliş başarıyla güncellendi!", timer: 2000, showConfirmButton: false });
          this.closeEditModal();
          this.fetchRaffles();
        } else {
          Swal.fire({ icon: "error", title: "Hata", text: result.message || "Çekiliş güncellenemedi!" });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Hata", text: `Güncelleme sırasında hata oluştu: ${error.message}` });
      }
    },
    openDeleteModal(raffle) {
      this.selectedRaffle = { ...raffle };
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
    },
    async confirmDelete() {
      Swal.fire({ title: "Siliniyor...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const response = await fetch(`${this.baseUrl}/api/Raffle/DeleteRaffle/${this.selectedRaffle.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.statusCode === 200) {
          Swal.fire({ icon: "success", title: "Başarılı", text: "Çekiliş başarıyla silindi!", timer: 2000, showConfirmButton: false });
          this.closeDeleteModal();
          this.fetchRaffles();
        } else {
          Swal.fire({ icon: "error", title: "Hata", text: result.message || "Çekiliş silinemedi!" });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Hata", text: `Silme sırasında hata oluştu: ${error.message}` });
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
};
</script>

<style scoped>
/* Diğer mevcut stillerin üstüne aşağıdakileri ekleyin veya eski style ile birleştirin */

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

.search-wrapper {
  display: flex;
  justify-content: flex-start;
  padding: 16px 20px 0 20px;
}
.search-input {
  width: 300px;
  max-width: 100%;
  border-radius: 6px;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
}

.sira-th, .sira-td {
  width: 10%;
  text-align: center !important;
}
.sira-badge {
  background: #2563eb;
  color: #fff;
  font-weight: bold;
  padding: 5px 13px;
  border-radius: 8px;
  font-size: 1rem;
  display: inline-block;
  text-align: center;
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
.btn-success {
  background-color: #10b981;
  border: none;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s;
}
.btn-success:hover {
  background-color: #059669;
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
th, td {
  padding: 12px;
  text-align: left;
  white-space: nowrap;
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
  width: 100vw;
  height: 100vh;
  background: rgba(38, 38, 38, 0.40);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
/* Küçük dikdörtgen modal */
.modal-add-form {
  background: #fff;
  border-radius: 14px;
  padding: 24px 30px 18px 30px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  max-width: 400px;
  width: 90%;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  animation: popIn .23s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes popIn {
  0% { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.modal-add-form h5 {
  font-size: 1.1rem;
  color: #2563eb;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
}
.modal-add-form .form-control {
  margin-bottom: 4px;
  font-size: 1rem;
}
.modal-add-form .form-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;
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
.form-label {
  font-size: 0.9rem;
  color: #1e3a8a;
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
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
  .table th, .table td {
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
  .btn-primary, .btn-secondary {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>
