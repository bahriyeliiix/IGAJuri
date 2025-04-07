<!-- src/components/DeleteModal.vue -->
<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <h5>Silme Onayı</h5>
        <p>Anket ID {{ surveyId }} silinsin mi?</p>
        <div class="modal-buttons">
          <button class="btn btn-danger" @click="$emit('confirm')">Evet, Sil</button>
          <button class="btn btn-secondary" @click="$emit('close')">Hayır</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      surveyId: { type: Number, required: true },
    },
  };
  </script>
  
  <style scoped>
  @import '@/assets/styles/surveyStyles.css';
  </style>