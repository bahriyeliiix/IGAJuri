<!-- src/components/SurveyTable.vue -->
<template>
  <div class="card mb-4">
    <div class="card-header">
      <button
        v-if="userRole === 1"
        class="btn btn-primary btn-sm"
        @click="$emit('open-add-modal')"
      >
        Yeni Ekle
      </button>
      <div class="search-container mt-3">
        <input
          v-model="localSearchQuery"
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
              <th class="sortable" @click="$emit('sort', 'surveyName')">
                Anket Adı
                <span v-if="sortKey === 'surveyName'">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th class="sortable" @click="$emit('sort', 'createdDate')">
                Oluşturulma Tarihi
                <span v-if="sortKey === 'createdDate'">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th class="sortable" @click="$emit('sort', 'plannedEndDate')">
                Planlanan Bitiş Tarihi
                <span v-if="sortKey === 'plannedEndDate'">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="surveys.length === 0">
              <td colspan="6" class="text-center">
                <span class="text-sm font-weight-bold">{{
                  noDataMessage
                }}</span>
              </td>
            </tr>
            <tr v-else v-for="(item, index) in surveys" :key="item.id">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ item.id }}</td>
              <td>{{ item.surveyName }}</td>
              <td>{{ formatDate(item.createdDate) }}</td>
              <td>{{ formatDate(item.plannedEndDate) }}</td>

              <!-- src/components/SurveyTable.vue (İlgili Kısım) -->
              <td class="action-buttons">
                <template v-if="userRole === 1">
                  <button
                    class="btn btn-jury btn-sm mx-1"
                    @click="$emit('open-jury-modal', item)"
                  >
                    Jüriler
                  </button>
                  <button
                    class="btn btn-dark btn-sm mx-1"
                    @click="$emit('go-to-survey-content', item.id)"
                  >
                    Detaylar
                  </button>
                  <button
                    class="btn btn-warning btn-sm mx-1"
                    @click="$emit('open-edit-modal', item)"
                  >
                    Düzenle
                  </button>
                  <button
                    v-if="item.isActive"
                    class="btn btn-secondary btn-sm mx-1"
                    @click="$emit('passivate-survey', item.id)"
                  >
                    Pasifleştir
                  </button>
                  <button
                    v-else
                    class="btn btn-activate btn-sm mx-1"
                    @click="$emit('activate-survey', item.id)"
                  >
                    Aktifleştir
                  </button>
                  <button
                    class="btn btn-results btn-sm mx-1"
                    @click="$emit('go-to-survey-results', item.id)"
                  >
                    Sonuçlar
                  </button>
                </template>
                <template v-else-if="userRole === 2">
                  <button
                    class="btn btn-info btn-sm mx-1"
                    @click="$emit('go-to-score', item.id)"
                  >
                    Puanla
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @prev-page="$emit('prev-page')"
        @next-page="$emit('next-page')"
        @go-to-page="$emit('go-to-page', $event)"
      />
      <div class="total-data text-right mt-2">
        Toplam Veri: {{ surveys.length }}
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from "./Pagination.vue";
import { formatDate } from "@/utils/dateUtils";

export default {
  components: { Pagination },
  props: {
    surveys: { type: Array, required: true },
    userRole: { type: Number, required: true },
    currentPage: { type: Number, required: true },
    itemsPerPage: { type: Number, required: true },
    totalPages: { type: Number, required: true },
    searchQuery: { type: String, default: "" },
    sortKey: { type: String, default: "" },
    sortOrder: { type: String, default: "asc" },
  },
  data() {
    return {
      noDataMessage: "Veri yok",
      localSearchQuery: this.searchQuery,
    };
  },
  watch: {
    localSearchQuery(newVal) {
      this.$emit("update:search-query", newVal);
    },
    searchQuery(newVal) {
      this.localSearchQuery = newVal;
    },
  },
  methods: {
    formatDate,
  },
};
</script>

<style scoped>
@import "@/assets/styles/surveyStyles.css";
</style>
