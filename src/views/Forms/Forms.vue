<template>
    <div class="container">
      <div class="card mb-4">
        <div class="card-header">
          <button class="btn btn-primary btn-sm" @click="openAddModal">
            Yeni Form Ekle
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover align-items-center mb-0">
              <thead class="thead-dark">
                <tr>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">Sıra No</th>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">ID</th>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">Form Başlığı</th>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">Oluşturulma Tarihi</th>
                  <th class="text-uppercase text-light text-xs font-weight-bolder">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paginatedForms.length === 0">
                  <td colspan="5" class="text-center">
                    <span class="text-sm font-weight-bold">Veri yok</span>
                  </td>
                </tr>
                <tr v-else v-for="(form, index) in paginatedForms" :key="form.id">
                  <td>
                    <span class="text-xs font-weight-bold">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold">{{ form.id }}</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold">{{ form.title }}</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold">{{ form.createdDate }}</span>
                  </td>
                  <td class="action-buttons">
  <button class="btn btn-dark btn-sm mx-1" @click="viewForm(form)">
    Görüntüle
  </button>
  <button class="btn btn-warning btn-sm mx-1" @click="editForm(form)">
    Düzenle
  </button>
  <button class="btn btn-danger btn-sm mx-1" @click="openDeleteModal(form.id)">
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
            <span class="text-sm font-weight-bold">Toplam Form: {{ forms.length }}</span>
          </div>
        </div>
  
        <!-- Yeni Form Ekle Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
          <div class="modal-content">
            <h5>Yeni Form Ekle</h5>
            <input
              v-model="newForm.title"
              type="text"
              class="form-control mb-3"
              placeholder="Form Başlığı"
            />
            <textarea
              v-model="newForm.description"
              class="form-control mb-3"
              placeholder="Form Açıklaması"
            ></textarea>
            <div class="modal-buttons">
              <button class="btn btn-primary" @click="saveForm">Kaydet</button>
              <button class="btn btn-secondary" @click="closeAddModal">Kapat</button>
            </div>
          </div>
        </div>
  
        <!-- Silme Onayı Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
          <div class="modal-content">
            <h5>Silme Onayı</h5>
            <p>Form ID {{ deleteFormId }} silinsin mi?</p>
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
    name: "FormList",
    data() {
      return {
        forms: [
          // Fake veriler
          { id: 1, title: "Anket 1", description: "Genel memnuniyet anketi", createdDate: "2025-05-01" },
          { id: 2, title: "Etkinlik Kayıt Formu", description: "Etkinlik katılım bilgileri", createdDate: "2025-05-03" },
          { id: 3, title: "Geri Bildirim Formu", description: "Ürün geri bildirimi", createdDate: "2025-05-04" },
        ],
        currentPage: 1,
        itemsPerPage: 10,
        showAddModal: false,
        showDeleteModal: false,
        newForm: { title: "", description: "" },
        deleteFormId: null,
      };
    },
    computed: {
      paginatedForms() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.forms.slice(start, end);
      },
      totalPages() {
        return Math.ceil(this.forms.length / this.itemsPerPage);
      },
    },
    methods: {
      fetchForms() {
        // TODO: Burası API ile bağlanmalı: GET /api/Form/List
        // Örnek API çağrısı:
        // fetch("https://localhost:7263/api/Form/List", {
        //   headers: { Authorization: `Bearer ${token}` },
        // }).then(response => response.json()).then(result => {
        //   this.forms = result.data;
        // });
        // Şu an fake verilerle çalışıyoruz
        // Fake veriler zaten data'da tanımlı
      },
      saveForm() {
        if (!this.newForm.title.trim()) {
          Swal.fire({
            icon: "warning",
            title: "Eksik Bilgi",
            text: "Form başlığı zorunludur!",
          });
          return;
        }
        // TODO: Burası API ile bağlanmalı: POST /api/Form/Create
        // Örnek API çağrısı:
        // fetch("https://localhost:7263/api/Form/Create", {
        //   method: "POST",
        //   headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        //   body: JSON.stringify(this.newForm),
        // }).then(response => response.json()).then(result => {
        //   this.forms.push(result.data);
        // });
        const newId = this.forms.length ? Math.max(...this.forms.map(f => f.id)) + 1 : 1;
        this.forms.push({
          id: newId,
          title: this.newForm.title,
          description: this.newForm.description,
          createdDate: new Date().toISOString().split("T")[0],
        });
        Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Form başarıyla oluşturuldu!",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeAddModal();
      },
      openAddModal() {
        this.newForm = { title: "", description: "" };
        this.showAddModal = true;
      },
      closeAddModal() {
        this.showAddModal = false;
      },
      viewForm(form) {
        this.$router.push(`/form/${form.id}/view`);
      },
      editForm(form) {
        this.$router.push(`/form/${form.id}/edit`);
      },
      openDeleteModal(id) {
        this.deleteFormId = id;
        this.showDeleteModal = true;
      },
      closeDeleteModal() {
        this.showDeleteModal = false;
      },
      confirmDelete() {
        // TODO: Burası API ile bağlanmalı: DELETE /api/Form/Delete/{id}
        // Örnek API çağrısı:
        // fetch(`https://localhost:7263/api/Form/Delete/${this.deleteFormId}`, {
        //   method: "DELETE",
        //   headers: { Authorization: `Bearer ${token}` },
        // }).then(response => response.json()).then(result => {
        //   this.forms = this.forms.filter(f => f.id !== this.deleteFormId);
        // });
        this.forms = this.forms.filter(f => f.id !== this.deleteFormId);
        Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Form başarıyla silindi!",
          timer: 2000,
          showConfirmButton: false,
        });
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
    background-color.tg { background-color: #3b82f6; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); }
  
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
}
  </style>