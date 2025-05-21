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
                  <th class="text-uppercase text-light text-xs font-weight-bolder">SIRA NO</th>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">ID</th>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">BAŞLIK</th>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">OLUŞTURULMA TARİHİ</th>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paginatedData.length === 0">
                  <td colspan="5" class="text-center">
                    <span class="text-sm font-weight-bold">{{ noDataMessage || "Veriler alınamadı." }}</span>
                  </td>
                </tr>
                <tr v-else v-for="(raffle, index) in paginatedData" :key="raffle.id">
                  <td>
                    <span class="text-xs font-weight-bold">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold">{{ raffle.id }}</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold">{{ raffle.title }}</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold">{{ formatDate(raffle.createdDate) }}</span>
                  </td>
                  <td class="action-buttons">
                    <button class="btn btn-dark btn-sm mx-1" @click="openDetailsModal(raffle)">Detaylar</button>
                    <button class="btn btn-warning btn-sm mx-1" @click="openEditModal(raffle)">Düzenle</button>
                    <button class="btn btn-danger btn-sm mx-1" @click="openDeleteModal(raffle.id)">Sil</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-container mt-3">
            <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-outline-primary mx-2">
              ÖNCEKİ
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
            <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-outline-primary mx-2">
              SONRAKI
            </button>
          </div>
          <div class="total-data text-right mt-2">
            <span class="text-sm font-weight-bold">Toplam Veri: {{ raffles.length }}</span>
          </div>
        </div>
  
        <!-- Modal: Yeni Ekle -->
        <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
          <div class="modal-content">
            <h5>Yeni Ekle</h5>
            <input v-model="newRaffle.title" type="text" class="form-control mb-3" placeholder="Başlık" />
            <textarea v-model="newRaffle.description" class="form-control mb-3" placeholder="Açıklama (Opsiyonel)" rows="4"></textarea>
            <label class="form-label">Başlangıç Tarihi</label>
            <input v-model="newRaffle.startDate" type="datetime-local" class="form-control mb-3" />
            <label class="form-label">Bitiş Tarihi</label>
            <input v-model="newRaffle.endDate" type="datetime-local" class="form-control mb-3" />
            <input v-model="newRaffle.prize" type="text" class="form-control mb-3" placeholder="Ödül (Opsiyonel)" />
            <div class="modal-buttons">
              <button class="btn btn-primary" @click="saveNewRaffle">Kaydet</button>
              <button class="btn btn-secondary" @click="closeAddModal">Kapat</button>
            </div>
          </div>
        </div>
  
        <!-- Modal: Detaylar -->
        <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
          <div class="modal-content">
            <h5>Çekiliş Detayları (ID: {{ selectedRaffle.id }})</h5>
            <div class="details-content">
              <p><strong>Başlık:</strong> {{ selectedRaffle.title }}</p>
              <p><strong>Açıklama:</strong> {{ selectedRaffle.description || "Belirtilmemiş" }}</p>
              <p><strong>Başlangıç Tarihi:</strong> {{ formatDateTime(selectedRaffle.startDate) }}</p>
              <p><strong>Bitiş Tarihi:</strong> {{ formatDateTime(selectedRaffle.endDate) }}</p>
              <p><strong>Ödül:</strong> {{ selectedRaffle.prize || "Belirtilmemiş" }}</p>
              <p><strong>Oluşturulma Tarihi:</strong> {{ formatDate(selectedRaffle.createdDate) }}</p>
            </div>
            <div class="modal-buttons">
              <button class="btn btn-secondary" @click="closeDetailsModal">Kapat</button>
            </div>
          </div>
        </div>
  
        <!-- Modal: Düzenle -->
        <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
          <div class="modal-content">
            <h5>Çekiliş Düzenle (ID: {{ selectedRaffle.id }})</h5>
            <input v-model="editRaffle.title" type="text" class="form-control mb-3" placeholder="Başlık" />
            <textarea v-model="editRaffle.description" class="form-control mb-3" placeholder="Açıklama (Opsiyonel)" rows="4"></textarea>
            <label class="form-label">Başlangıç Tarihi</label>
            <input v-model="editRaffle.startDate" type="datetime-local" class="form-control mb-3" />
            <label class="form-label">Bitiş Tarihi</label>
            <input v-model="editRaffle.endDate" type="datetime-local" class="form-control mb-3" />
            <input v-model="editRaffle.prize" type="text" class="form-control mb-3" placeholder="Ödül (Opsiyonel)" />
            <div class="modal-buttons">
              <button class="btn btn-primary" @click="saveEditRaffle">Kaydet</button>
              <button class="btn btn-secondary" @click="closeEditModal">Kapat</button>
            </div>
          </div>
        </div>
  
        <!-- Modal: Silme Onayı -->
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
          <div class="modal-content">
            <h5>Silme Onayı</h5>
            <p>Çekiliş ID {{ deleteRaffleId }} silinsin mi?</p>
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
    name: "RaffleList",
    data() {
      return {
        raffles: [],
        baseUrl: "https://localhost:7058",
        token: null,
        noDataMessage: "",
        currentPage: 1,
        itemsPerPage: 10,
        showAddModal: false,
        showEditModal: false,
        showDeleteModal: false,
        showDetailsModal: false,
        newRaffle: { title: "", description: "", startDate: "", endDate: "", prize: "" },
        editRaffle: { id: null, title: "", description: "", startDate: "", endDate: "", prize: "" },
        selectedRaffle: {},
        deleteRaffleId: null,
      };
    },
    computed: {
      paginatedData() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.raffles.slice(start, end);
      },
      totalPages() {
        return Math.ceil(this.raffles.length / this.itemsPerPage);
      },
    },
    mounted() {
      this.token = localStorage.getItem("token");
      if (!this.token) {
        this.noDataMessage = "Oturum açmanız gerekiyor.";
        Swal.fire({
          icon: "warning",
          title: "Oturum Gerekli",
          text: "Lütfen oturum açın!",
          confirmButtonText: "Tamam",
        }).then(() => {
          this.$router.push("/login"); // Giriş sayfasına yönlendirme
        });
        return;
      }
      this.fetchRaffles();
    },
    methods: {
      async fetchRaffles() {
        if (!this.token) {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Token bulunamadı. Lütfen oturum açın!",
          });
          this.$router.push("/login");
          return;
        }
        try {
          const response = await fetch(`${this.baseUrl}/api/Raffle/GetAll`, {
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            if (response.status === 401) {
              throw new Error("Yetkisiz erişim: Token geçersiz veya süresi dolmuş.");
            }
            throw new Error("API isteği başarısız");
          }
          const data = await response.json();
          this.raffles = data.filter((item) => item.surveyType === 2).map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            startDate: item.startDate,
            endDate: item.endDate,
            prize: item.prize,
            createdDate: item.createdDate || new Date().toISOString(),
            surveyType: item.surveyType,
          }));
          if (this.raffles.length === 0) this.noDataMessage = "Veriler alınamadı.";
        } catch (error) {
          this.noDataMessage = "Veriler alınamadı.";
          Swal.fire("Hata", `Veriler alınamadı: ${error.message}`, "error");
          if (error.message.includes("Yetkisiz")) {
            this.$router.push("/login");
          }
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
      openAddModal() {
        if (!this.token) {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Token bulunamadı. Lütfen oturum açın!",
          });
          this.$router.push("/login");
          return;
        }
        this.newRaffle = { title: "", description: "", startDate: "", endDate: "", prize: "" };
        this.showAddModal = true;
      },
      closeAddModal() {
        this.showAddModal = false;
      },
      async saveNewRaffle() {
        if (!this.token) {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Token bulunamadı. Lütfen oturum açın!",
          });
          this.$router.push("/login");
          return;
        }
        if (!this.newRaffle.title.trim() || !this.newRaffle.startDate || !this.newRaffle.endDate) {
          Swal.fire({ icon: "warning", title: "Eksik Bilgi", text: "Başlık, başlangıç ve bitiş tarihi zorunludur!" });
          return;
        }
        if (new Date(this.newRaffle.endDate) <= new Date(this.newRaffle.startDate)) {
          Swal.fire({ icon: "warning", title: "Geçersiz Tarih", text: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır!" });
          return;
        }
        Swal.fire({ title: "Kaydediliyor...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
          const response = await fetch(`${this.baseUrl}/api/Raffle/CreateOrEdit`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: this.newRaffle.title,
              description: this.newRaffle.description || null,
              startDate: new Date(this.newRaffle.startDate).toISOString(),
              endDate: new Date(this.newRaffle.endDate).toISOString(),
              prize: this.newRaffle.prize || null,
              surveyType: 2,
            }),
          });
          const result = await response.json();
          if (response.status === 401) {
            throw new Error("Yetkisiz erişim: Token geçersiz veya süresi dolmuş.");
          }
          if (result.statusCode === 200) {
            this.raffles.push({
              id: result.data?.id || Math.max(...this.raffles.map(r => r.id), 0) + 1,
              title: this.newRaffle.title,
              description: this.newRaffle.description,
              startDate: this.newRaffle.startDate,
              endDate: this.newRaffle.endDate,
              prize: this.newRaffle.prize,
              createdDate: new Date().toISOString(),
              surveyType: 2,
            });
            Swal.fire({ icon: "success", title: "Başarılı", text: "Çekiliş başarıyla eklendi!", timer: 2000, showConfirmButton: false });
            this.closeAddModal();
            this.fetchRaffles(); // Listeyi yenile
          } else {
            Swal.fire({ icon: "error", title: "Hata", text: result.message || "Çekiliş eklenemedi!" });
          }
        } catch (error) {
          Swal.fire({ icon: "error", title: "Hata", text: `Ekleme sırasında hata oluştu: ${error.message}` });
          if (error.message.includes("Yetkisiz")) {
            this.$router.push("/login");
          }
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
        if (!this.token) {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Token bulunamadı. Lütfen oturum açın!",
          });
          this.$router.push("/login");
          return;
        }
        this.editRaffle = {
          id: raffle.id,
          title: raffle.title,
          description: raffle.description || "",
          startDate: raffle.startDate ? new Date(raffle.startDate).toISOString().slice(0, 16) : "",
          endDate: raffle.endDate ? new Date(raffle.endDate).toISOString().slice(0, 16) : "",
          prize: raffle.prize || "",
        };
        this.showEditModal = true;
      },
      closeEditModal() {
        this.showEditModal = false;
      },
      async saveEditRaffle() {
        if (!this.token) {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Token bulunamadı. Lütfen oturum açın!",
          });
          this.$router.push("/login");
          return;
        }
        if (!this.editRaffle.title.trim() || !this.editRaffle.startDate || !this.editRaffle.endDate) {
          Swal.fire({ icon: "warning", title: "Eksik Bilgi", text: "Başlık, başlangıç ve bitiş tarihi zorunludur!" });
          return;
        }
        if (new Date(this.editRaffle.endDate) <= new Date(this.editRaffle.startDate)) {
          Swal.fire({ icon: "warning", title: "Geçersiz Tarih", text: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır!" });
          return;
        }
        Swal.fire({ title: "Güncelleniyor...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
          const response = await fetch(`${this.baseUrl}/api/Raffle/Update/${this.editRaffle.id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: this.editRaffle.id,
              title: this.editRaffle.title,
              description: this.editRaffle.description || null,
              startDate: new Date(this.editRaffle.startDate).toISOString(),
              endDate: new Date(this.editRaffle.endDate).toISOString(),
              prize: this.editRaffle.prize || null,
              surveyType: 2,
            }),
          });
          const result = await response.json();
          if (response.status === 401) {
            throw new Error("Yetkisiz erişim: Token geçersiz veya süresi dolmuş.");
          }
          if (result.statusCode === 200) {
            const index = this.raffles.findIndex(r => r.id === this.editRaffle.id);
            this.raffles.splice(index, 1, {
              ...this.editRaffle,
              startDate: this.editRaffle.startDate,
              endDate: this.editRaffle.endDate,
              createdDate: this.raffles[index].createdDate,
              surveyType: 2,
            });
            Swal.fire({ icon: "success", title: "Başarılı", text: "Çekiliş başarıyla güncellendi!", timer: 2000, showConfirmButton: false });
            this.closeEditModal();
            this.fetchRaffles(); // Listeyi yenile
          } else {
            Swal.fire({ icon: "error", title: "Hata", text: result.message || "Çekiliş güncellenemedi!" });
          }
        } catch (error) {
          Swal.fire({ icon: "error", title: "Hata", text: `Güncelleme sırasında hata oluştu: ${error.message}` });
          if (error.message.includes("Yetkisiz")) {
            this.$router.push("/login");
          }
        }
      },
      openDeleteModal(id) {
        if (!this.token) {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Token bulunamadı. Lütfen oturum açın!",
          });
          this.$router.push("/login");
          return;
        }
        this.deleteRaffleId = id;
        this.showDeleteModal = true;
      },
      closeDeleteModal() {
        this.showDeleteModal = false;
      },
      async confirmDelete() {
        if (!this.token) {
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Token bulunamadı. Lütfen oturum açın!",
          });
          this.$router.push("/login");
          return;
        }
        Swal.fire({ title: "Siliniyor...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
          const response = await fetch(`${this.baseUrl}/api/Raffle/Delete/${this.deleteRaffleId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          });
          const result = await response.json();
          if (response.status === 401) {
            throw new Error("Yetkisiz erişim: Token geçersiz veya süresi dolmuş.");
          }
          if (result.statusCode === 200) {
            this.raffles = this.raffles.filter((item) => item.id !== this.deleteRaffleId);
            Swal.fire({ icon: "success", title: "Başarılı", text: "Çekiliş başarıyla silindi!", timer: 2000, showConfirmButton: false });
            this.closeDeleteModal();
            this.fetchRaffles(); // Listeyi yenile
          } else {
            Swal.fire({ icon: "error", title: "Hata", text: result.message || "Çekiliş silinemedi!" });
          }
        } catch (error) {
          Swal.fire({ icon: "error", title: "Hata", text: `Silme sırasında hata oluştu: ${error.message}` });
          if (error.message.includes("Yetkisiz")) {
            this.$router.push("/login");
          }
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