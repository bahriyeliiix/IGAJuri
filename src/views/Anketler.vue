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
                    Id
                  </th>
                  <th
                    class="text-uppercase text-light text-xs font-weight-bolder"
                  >
                    Anket Adı
                  </th>
                  <th
                    class="text-uppercase text-light text-xs font-weight-bolder"
                  >
                    Oluşturulma Tarihi
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
                  <td colspan="5" class="text-center">
                    <span class="text-sm font-weight-bold">{{
                      noDataMessage || "Veri yok"
                    }}</span>
                  </td>
                </tr>
                <tr v-else v-for="(item, index) in paginatedData" :key="index">
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
                      item.surveyName
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
                      @click="openFilePathModal(item)"
                    >
                      Dosya Yolu
                    </button>
                    <button
                      class="btn btn-success btn-sm mx-1"
                      @click="openJuryModal(item)"
                    >
                      Jüriler
                    </button>
                    <button
                      class="btn btn-dark btn-sm mx-1"
                      @click="openJuryModal(item)"
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
      </div>
  
      <!-- Modallar (değişmedi, aynı kaldı) -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-content">
          <h5>Yeni Anket Ekle</h5>
          <input
            v-model="newSurveyName"
            type="text"
            class="form-control mb-3"
            placeholder="Anket Adı"
          />
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveNewSurvey">Kaydet</button>
            <button class="btn btn-secondary" @click="closeAddModal">
              Kapat
            </button>
          </div>
        </div>
      </div>
  
      <div
        v-if="showFilePathModal"
        class="modal-overlay"
        @click.self="closeFilePathModal"
      >
        <div class="modal-content">
          <h5>Dosya Yolu Gir (ID: {{ selectedSurvey.id }})</h5>
          <input
            v-model="filePath"
            type="text"
            class="form-control mb-3"
            placeholder="Dosya Yolu"
          />
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveFilePath">Kaydet</button>
            <button class="btn btn-secondary" @click="closeFilePathModal">
              Kapat
            </button>
          </div>
        </div>
      </div>
  
      <div
        v-if="showJuryModal"
        class="modal-overlay"
        @click.self="closeJuryModal"
      >
        <div class="modal-content">
          <h5>Jüri Ekle (ID: {{ selectedSurvey.id }})</h5>
          <div class="jury-list">
            <div v-for="jury in fakeJurors" :key="jury.id" class="jury-item">
              <input
                type="checkbox"
                class="form-check-input"
                :id="'jury-' + jury.id"
                v-model="selectedJurors"
                :value="jury.id"
              />
              <label class="form-check-label" :for="'jury-' + jury.id">{{
                jury.name
              }}</label>
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
    </div>
  </template>
  
  <script>
  // Script kısmı değişmedi, aynı kaldı
  export default {
    data() {
      return {
        apiData: [
          {
            id: 1,
            surveyName: "Anket 1",
            createdDate: "2025-03-01",
            filePath: "",
            jurors: [],
          },
          {
            id: 2,
            surveyName: "Anket 2",
            createdDate: "2025-03-05",
            filePath: "",
            jurors: [],
          },
          {
            id: 3,
            surveyName: "Anket 3",
            createdDate: "2025-03-10",
            filePath: "",
            jurors: [],
          },
          {
            id: 4,
            surveyName: "Anket 4",
            createdDate: "2025-03-15",
            filePath: "",
            jurors: [],
          },
          {
            id: 5,
            surveyName: "Anket 5",
            createdDate: "2025-03-20",
            filePath: "",
            jurors: [],
          },
          {
            id: 2,
            surveyName: "Anket 2",
            createdDate: "2025-03-05",
            filePath: "",
            jurors: [],
          },
          {
            id: 3,
            surveyName: "Anket 3",
            createdDate: "2025-03-10",
            filePath: "",
            jurors: [],
          },
          {
            id: 4,
            surveyName: "Anket 4",
            createdDate: "2025-03-15",
            filePath: "",
            jurors: [],
          },
          {
            id: 5,
            surveyName: "Anket 5",
            createdDate: "2025-03-20",
            filePath: "",
            jurors: [],
          },
          {
            id: 2,
            surveyName: "Anket 2",
            createdDate: "2025-03-05",
            filePath: "",
            jurors: [],
          },
          {
            id: 3,
            surveyName: "Anket 3",
            createdDate: "2025-03-10",
            filePath: "",
            jurors: [],
          },
          {
            id: 4,
            surveyName: "Anket 4",
            createdDate: "2025-03-15",
            filePath: "",
            jurors: [],
          },
          {
            id: 5,
            surveyName: "Anket 5",
            createdDate: "2025-03-20",
            filePath: "",
            jurors: [],
          },
          {
            id: 2,
            surveyName: "Anket 2",
            createdDate: "2025-03-05",
            filePath: "",
            jurors: [],
          },
          {
            id: 3,
            surveyName: "Anket 3",
            createdDate: "2025-03-10",
            filePath: "",
            jurors: [],
          },
          {
            id: 4,
            surveyName: "Anket 4",
            createdDate: "2025-03-15",
            filePath: "",
            jurors: [],
          },
          {
            id: 5,
            surveyName: "Anket 5",
            createdDate: "2025-03-20",
            filePath: "",
            jurors: [],
          },
          {
            id: 2,
            surveyName: "Anket 2",
            createdDate: "2025-03-05",
            filePath: "",
            jurors: [],
          },
          {
            id: 3,
            surveyName: "Anket 3",
            createdDate: "2025-03-10",
            filePath: "",
            jurors: [],
          },
          {
            id: 4,
            surveyName: "Anket 4",
            createdDate: "2025-03-15",
            filePath: "",
            jurors: [],
          },
          {
            id: 5,
            surveyName: "Anket 5",
            createdDate: "2025-03-20",
            filePath: "",
            jurors: [],
          },
          {
            id: 2,
            surveyName: "Anket 2",
            createdDate: "2025-03-05",
            filePath: "",
            jurors: [],
          },
          {
            id: 3,
            surveyName: "Anket 3",
            createdDate: "2025-03-10",
            filePath: "",
            jurors: [],
          },
          {
            id: 4,
            surveyName: "Anket 4",
            createdDate: "2025-03-15",
            filePath: "",
            jurors: [],
          },
          {
            id: 5,
            surveyName: "Anket 5",
            createdDate: "2025-03-20",
            filePath: "",
            jurors: [],
          },
          {
            id: 2,
            surveyName: "Anket 2",
            createdDate: "2025-03-05",
            filePath: "",
            jurors: [],
          },
          {
            id: 3,
            surveyName: "Anket 3",
            createdDate: "2025-03-10",
            filePath: "",
            jurors: [],
          },
          {
            id: 4,
            surveyName: "Anket 4",
            createdDate: "2025-03-15",
            filePath: "",
            jurors: [],
          },
          {
            id: 5,
            surveyName: "Anket 5",
            createdDate: "2025-03-20",
            filePath: "",
            jurors: [],
          },
        ],
        fakeJurors: [
          { id: 1, name: "Ali Yılmaz" },
          { id: 2, name: "Ayşe Kaya" },
          { id: 3, name: "Mehmet Demir" },
          { id: 4, name: "Fatma Şahin" },
          { id: 5, name: "Hasan Öztürk" },
          { id: 6, name: "Zeynep Aksoy" },
          { id: 7, name: "Emre Çelik" },
          { id: 8, name: "Selin Arslan" },
          { id: 9, name: "Burak Kılıç" },
          { id: 10, name: "Ebru Güneş" },
        ],
        noDataMessage: "",
        currentPage: 1,
        itemsPerPage: 10,
        showAddModal: false,
        showFilePathModal: false,
        showJuryModal: false,
        showEditModal: false,
        showDeleteModal: false,
        newSurveyName: "",
        filePath: "",
        editSurveyName: "",
        selectedSurvey: {},
        deleteSurveyId: null,
        selectedJurors: [],
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
      openAddModal() {
        this.newSurveyName = "";
        this.showAddModal = true;
      },
      closeAddModal() {
        this.showAddModal = false;
      },
      saveNewSurvey() {
        if (this.newSurveyName.trim()) {
          const newId = this.apiData.length
            ? Math.max(...this.apiData.map((item) => item.id)) + 1
            : 1;
          this.apiData.push({
            id: newId,
            surveyName: this.newSurveyName,
            createdDate: new Date().toISOString().split("T")[0],
            filePath: "",
            jurors: [],
          });
          this.closeAddModal();
        } else {
          alert("Anket adı boş olamaz!");
        }
      },
      openFilePathModal(survey) {
        this.selectedSurvey = survey;
        this.filePath = survey.filePath || "";
        this.showFilePathModal = true;
      },
      closeFilePathModal() {
        this.showFilePathModal = false;
      },
      saveFilePath() {
        this.selectedSurvey.filePath = this.filePath;
        this.closeFilePathModal();
      },
      openJuryModal(survey) {
        this.selectedSurvey = survey;
        this.selectedJurors = [...survey.jurors];
        this.showJuryModal = true;
      },
      closeJuryModal() {
        this.showJuryModal = false;
      },
      saveJury() {
        this.selectedSurvey.jurors = [...this.selectedJurors];
        this.closeJuryModal();
      },
      openEditModal(survey) {
        this.selectedSurvey = survey;
        this.editSurveyName = survey.surveyName;
        this.showEditModal = true;
      },
      closeEditModal() {
        this.showEditModal = false;
      },
      saveEditSurvey() {
        if (this.editSurveyName.trim()) {
          this.selectedSurvey.surveyName = this.editSurveyName;
          this.closeEditModal();
        } else {
          alert("Anket adı boş olamaz!");
        }
      },
      openDeleteModal(id) {
        this.deleteSurveyId = id;
        this.showDeleteModal = true;
      },
      closeDeleteModal() {
        this.showDeleteModal = false;
      },
      confirmDelete() {
        this.apiData = this.apiData.filter(
          (item) => item.id !== this.deleteSurveyId
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
  
  /* Primary Buton (Yeni Ekle, Kaydet vb.) */
  .btn-primary {
    background-color: #60a5fa; /* Canlı ama soft mavi */
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
    background-color: #3b82f6; /* Biraz daha koyu mavi */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  /* Action Butonlar (Dosya, Jüri, Düzenle, Sil) */
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
    background-color: #7dd3fc; /* Soft cyan */
    color: #fff;
    border: none;
  }
  .btn-info:hover {
    background-color: #0ea5e9; /* Daha koyu cyan */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .btn-success {
    background-color: #6ee7b7; /* Soft yeşil */
    color: #fff;
    border: none;
  }
  .btn-success:hover {
    background-color: #10b981; /* Daha koyu yeşil */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .btn-warning {
    background-color: #fcd34d; /* Soft sarı */
    color: #fff;
    border: none;
  }
  .btn-warning:hover {
    background-color: #f59e0b; /* Daha koyu sarı */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .btn-danger {
    background-color: #f87171; /* Soft kırmızı */
    color: #fff;
    border: none;
  }
  .btn-danger:hover {
    background-color: #ef4444; /* Daha koyu kırmızı */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  /* Secondary Buton (Kapat, Hayır vb.) */
  .btn-secondary {
    background-color: #e2e8f0; /* Soft gri */
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
  
  /* Pagination Butonlar */
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
  
  /* Mevcut diğer stiller */
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
    background-color: #1e3a8a; /* Daha şık koyu mavi */
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
  
  /* Modal Stilleri */
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
  
  /* Modal İçeriği */
  .modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid #e2e8f0; /* Hafif kenarlık */
  }
  
  /* Başlık */
  .modal-content h5 {
    margin-bottom: 15px;
    color: #1e3a8a;
    font-weight: 600;
    font-size: 1.1rem;
    padding-bottom: 10px;
    border-bottom: 1px solid #e2e8f0; /* Başlık altına ince çizgi */
  }
  
  .form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  
  .jury-list {
    max-height: 250px; /* 10 kişi için yeterli yükseklik */
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #e2e8f0; /* Liste çevresine kenarlık */
    border-radius: 6px;
    background-color: #f8fafc; /* Hafif arka plan rengi */
  }
  .jury-item {
    display: flex;
    align-items: center;
    padding: 8px 0; /* Daha nizami boşluk */
    border-bottom: 1px solid #edf2f7; /* Öğeler arasına ince çizgi */
  }
  .jury-item:last-child {
    border-bottom: none;
  }
  
  .form-check {
    padding-left: 1.5rem;
    margin-bottom: 10px;
  }
  
  .form-check-input {
    margin-right: 10px; /* Checkbox ile etiket arası boşluk */
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  /* Etiket */
  .form-check-label {
    color: #475569;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    flex-grow: 1; /* Etiketin alanı kaplaması için */
  }
  
  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0; /* Butonlar üstüne çizgi */
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
  
  /* Secondary Buton */
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
  
  /* Responsive Tasarım */
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
    .jury-list {
      padding: 8px;
    }
    .jury-item {
      padding: 6px 0;
    }
    .btn-primary, .btn-secondary {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
  }
  </style>
  