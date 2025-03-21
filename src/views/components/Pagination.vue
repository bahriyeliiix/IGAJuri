<template>
    <div class="pagination mt-3 d-flex justify-content-center align-items-center">
      <button @click="$emit('prev')" :disabled="currentPage === 1" class="btn btn-outline-custom mx-2">
        Önceki
      </button>
      <div class="page-numbers mx-2">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="$emit('go-to', page)"
          :class="['page-btn', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
      </div>
      <button @click="$emit('next')" :disabled="currentPage === totalPages" class="btn btn-outline-custom mx-2">
        Sonraki
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      currentPage: Number,
      totalPages: Number,
    },
  };
  </script>