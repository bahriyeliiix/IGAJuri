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
                    class="btn btn-info btn-sm mx-1"
                    @click="openDepartmentModal(item)"
                  >
                    Departman Bilgisi
                  </button>
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
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-content">
          <h5>Yeni Jüri Ekle</h5>
          <input
            v-model="newJuryFullName"
            type="text"
            class="form-control mb-3"
            placeholder="İsim Soyisim"
          />
          <input
            v-model="newJuryDepartment"
            type="text"
            class="form-control mb-3"
            placeholder="Departman"
          />
          <input
            v-model="newJuryContact"
            type="text"
            class="form-control mb-3"
            placeholder="İletişim Bilgisi"
          />
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveNewJury">Kaydet</button>
            <button class="btn btn-secondary" @click="closeAddModal">
              Kapat
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showDepartmentModal"
        class="modal-overlay"
        @click.self="closeDepartmentModal"
      >
        <div class="modal-content">
          <h5>Departman Bilgisi (ID: {{ selectedJury.id }})</h5>
          <input
            v-model="departmentInfo"
            type="text"
            class="form-control mb-3"
            placeholder="Departman Bilgisi"
            disabled
          />
          <div class="modal-buttons">
            <button class="btn btn-secondary" @click="closeDepartmentModal">
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
            <p><strong>Oluşturulma Tarihi:</strong> {{ selectedJury.createdDate }}</p>
            <p><strong>Departman:</strong> {{ selectedJury.department || "Belirtilmemiş" }}</p>
            <p><strong>İletişim Bilgisi:</strong> {{ selectedJury.contactInfo || "Belirtilmemiş" }}</p>
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
            v-model="editJuryDepartment"
            type="text"
            class="form-control mb-3"
            placeholder="Departman"
          />
          <input
            v-model="editJuryContact"
            type="text"
            class="form-control mb-3"
            placeholder="İletişim Bilgisi"
          />
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
export default {
  name: "Juriler",
  data() {
    return {
      apiData: [
        { id: 1, juryFullName: "Ali Yılmaz", createdDate: "2025-03-01", department: "Yazılım", contactInfo: "ali.yilmaz@example.com" },
        { id: 2, juryFullName: "Ayşe Kaya", createdDate: "2025-03-02", department: "Tasarım", contactInfo: "ayse.kaya@example.com" },
        { id: 3, juryFullName: "Mehmet Demir", createdDate: "2025-03-03", department: "Pazarlama", contactInfo: "mehmet.demir@example.com" },
        { id: 4, juryFullName: "Fatma Şahin", createdDate: "2025-03-04", department: "İnsan Kaynakları", contactInfo: "fatma.sahin@example.com" },
        { id: 5, juryFullName: "Hasan Öztürk", createdDate: "2025-03-05", department: "Finans", contactInfo: "hasan.ozturk@example.com" },
        { id: 6, juryFullName: "Zeynep Aksoy", createdDate: "2025-03-06", department: "Yazılım", contactInfo: "zeynep.aksoy@example.com" },
        { id: 7, juryFullName: "Emre Çelik", createdDate: "2025-03-07", department: "Tasarım", contactInfo: "emre.celik@example.com" },
        { id: 8, juryFullName: "Selin Arslan", createdDate: "2025-03-08", department: "Pazarlama", contactInfo: "selin.arslan@example.com" },
        { id: 9, juryFullName: "Burak Güneş", createdDate: "2025-03-09", department: "İnsan Kaynakları", contactInfo: "burak.gunes@example.com" },
        { id: 10, juryFullName: "Ece Aydın", createdDate: "2025-03-10", department: "Finans", contactInfo: "ece.aydin@example.com" },
        { id: 11, juryFullName: "Caner Toprak", createdDate: "2025-03-11", department: "Yazılım", contactInfo: "caner.toprak@example.com" },
        { id: 12, juryFullName: "Derya Deniz", createdDate: "2025-03-12", department: "Tasarım", contactInfo: "derya.deniz@example.com" },
        { id: 13, juryFullName: "Kaan Polat", createdDate: "2025-03-13", department: "Pazarlama", contactInfo: "kaan.polat@example.com" },
        { id: 14, juryFullName: "Merve Yıldız", createdDate: "2025-03-14", department: "İnsan Kaynakları", contactInfo: "merve.yildiz@example.com" },
        { id: 15, juryFullName: "Okan Şimşek", createdDate: "2025-03-15", department: "Finans", contactInfo: "okan.simsek@example.com" },
        { id: 16, juryFullName: "Pınar Korkmaz", createdDate: "2025-03-16", department: "Yazılım", contactInfo: "pinar.korkmaz@example.com" },
        { id: 17, juryFullName: "Tolga Eren", createdDate: "2025-03-17", department: "Tasarım", contactInfo: "tolga.eren@example.com" },
        { id: 18, juryFullName: "Seda Çetin", createdDate: "2025-03-18", department: "Pazarlama", contactInfo: "seda.cetin@example.com" },
        { id: 19, juryFullName: "Yasin Kaplan", createdDate: "2025-03-19", department: "İnsan Kaynakları", contactInfo: "yasin.kaplan@example.com" },
        { id: 20, juryFullName: "Buse Tekin", createdDate: "2025-03-20", department: "Finans", contactInfo: "buse.tekin@example.com" }
      ],
      noDataMessage: "",
      currentPage: 1,
      itemsPerPage: 10,
      showAddModal: false,
      showDepartmentModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showDetailsModal: false,
      newJuryFullName: "",
      newJuryDepartment: "",
      newJuryContact: "",
      departmentInfo: "",
      editJuryFullName: "",
      editJuryDepartment: "",
      editJuryContact: "",
      selectedJury: {},
      deleteJuryId: null
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
    }
  },
  methods: {
    openAddModal() {
      this.newJuryFullName = "";
      this.newJuryDepartment = "";
      this.newJuryContact = "";
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    saveNewJury() {
      if (this.newJuryFullName.trim()) {
        const newId = this.apiData.length
          ? Math.max(...this.apiData.map((item) => item.id)) + 1
          : 1;
        this.apiData.push({
          id: newId,
          juryFullName: this.newJuryFullName,
          createdDate: new Date().toISOString().split("T")[0],
          department: this.newJuryDepartment,
          contactInfo: this.newJuryContact
        });
        this.closeAddModal();
      } else {
        alert("Jüri adı soyadı boş olamaz!");
      }
    },
    openDepartmentModal(jury) {
      this.selectedJury = jury;
      this.departmentInfo = jury.department || "";
      this.showDepartmentModal = true;
    },
    closeDepartmentModal() {
      this.showDepartmentModal = false;
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
      this.editJuryDepartment = jury.department;
      this.editJuryContact = jury.contactInfo;
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    saveEditJury() {
      if (this.editJuryFullName.trim()) {
        this.selectedJury.juryFullName = this.editJuryFullName;
        this.selectedJury.department = this.editJuryDepartment;
        this.selectedJury.contactInfo = this.editJuryContact;
        this.closeEditModal();
      } else {
        alert("Jüri adı soyadı boş olamaz!");
      }
    },
    openDeleteModal(id) {
      this.deleteJuryId = id;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
    },
    confirmDelete() {
      this.apiData = this.apiData.filter(
        (item) => item.id !== this.deleteJuryId
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
    }
  }
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

.btn-info {
  background-color: #7dd3fc;
  color: #fff;
  border: none;
}
.btn-info:hover {
  background-color: #0ea5e9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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