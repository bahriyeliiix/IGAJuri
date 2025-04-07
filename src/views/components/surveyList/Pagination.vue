<!-- src/components/Pagination.vue -->
<template>
    <div class="pagination-container mt-3">
      <button
        @click="$emit('prev-page')"
        :disabled="currentPage === 1"
        class="btn btn-outline-primary mx-2"
      >
        Önceki
      </button>
      <div class="page-numbers">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="$emit('go-to-page', page)"
          :class="['page-btn', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
      </div>
      <button
        @click="$emit('next-page')"
        :disabled="currentPage === totalPages"
        class="btn btn-outline-primary mx-2"
      >
        Sonraki
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      currentPage: { type: Number, required: true },
      totalPages: { type: Number, required: true },
    },
  };
  </script>
  
  <style scoped>
  @import '@/assets/styles/surveyStyles.css';
  </style>