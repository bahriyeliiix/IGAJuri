<!-- src/components/JuryModal.vue -->
<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <h5>Jüri Ekle (ID: {{ survey.id }})</h5>
        <div class="jury-list">
          <div v-for="jury in jurors" :key="jury.id" class="jury-item">
            <input
              type="checkbox"
              class="form-check-input"
              :id="'jury-' + jury.id"
              v-model="localSelectedJurors"
              :value="jury.id"
            />
            <label class="form-check-label" :for="'jury-' + jury.id">
              {{ jury.username }} ({{ jury.email }})
            </label>
          </div>
        </div>
        <div class="modal-buttons">
          <button class="btn btn-primary" @click="$emit('save')">Kaydet</button>
          <button class="btn btn-secondary" @click="$emit('close')">Kapat</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      survey: { type: Object, required: true },
      jurors: { type: Array, required: true },
      selectedJurors: { type: Array, required: true },
    },
    data() {
      return {
        localSelectedJurors: [...this.selectedJurors],
      };
    },
    watch: {
      localSelectedJurors(newVal) {
        this.$emit('update:selected-jurors', newVal);
      },
    },
  };
  </script>
  
  <style scoped>
  @import '@/assets/styles/surveyStyles.css';
  </style>