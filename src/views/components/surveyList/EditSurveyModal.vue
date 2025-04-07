<!-- src/components/EditSurveyModal.vue -->
<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <h5>Anket Düzenle (ID: {{ survey.id }})</h5>
        <div class="form-group">
          <label>Anket Adı <span class="required">*</span></label>
          <input
            v-model="editSurveyName"
            type="text"
            class="form-control mb-3"
            :class="{ 'is-invalid': editFormErrors.surveyName }"
            placeholder="Anket Adı"
            @input="validateForm"
          />
          <div v-if="editFormErrors.surveyName" class="invalid-feedback">
            Anket adı zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Açıklama</label>
          <textarea
            v-model="editSurveyDescription"
            class="form-control mb-3"
            placeholder="Açıklama"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Dosya Yolu <span class="required">*</span></label>
          <div class="input-group mb-3">
            <input
              v-model="editSurveyPath"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': editFormErrors.surveyPath }"
              placeholder="Dosya Yolu"
              readonly
            />
            <button class="btn btn-outline-secondary" @click="$emit('open-folder-dialog')">
              Klasör Seç
            </button>
          </div>
          <div v-if="editFormErrors.surveyPath" class="invalid-feedback">
            Dosya yolu zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Planlanan Bitiş Tarihi <span class="required">*</span></label>
          <input
            v-model="editSurveyPlannedEndDate"
            type="date"
            class="form-control mb-3"
            :class="{ 'is-invalid': editFormErrors.surveyDate }"
            @input="validateForm"
          />
          <div v-if="editFormErrors.surveyDate" class="invalid-feedback">
            Tarih zorunludur
          </div>
        </div>
        <div class="modal-buttons">
          <button
            class="btn btn-primary"
            @click="save"
            :disabled="!isFormValid"
          >
            Kaydet
          </button>
          <button class="btn btn-secondary" @click="$emit('close')">
            Kapat
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      survey: { type: Object, required: true },
    },
    data() {
      return {
        editSurveyName: this.survey.surveyName,
        editSurveyDescription: this.survey.description,
        editSurveyPath: this.survey.filePath,
        editSurveyPlannedEndDate: this.survey.plannedEndDate?.split('T')[0] || '',
        editFormErrors: {
          surveyName: false,
          surveyPath: false,
          surveyDate: false,
        },
        isFormValid: true,
      };
    },
    methods: {
      validateForm() {
        this.editFormErrors = {
          surveyName: !this.editSurveyName.trim(),
          surveyPath: !this.editSurveyPath.trim(),
          surveyDate: !this.editSurveyPlannedEndDate,
        };
        this.isFormValid = !Object.values(this.editFormErrors).some(error => error);
      },
      save() {
        this.validateForm();
        if (this.isFormValid) {
          const updatedSurvey = {
            id: this.survey.id,
            isDeleted: this.survey.isDeleted,
            isActive: this.survey.isActive,
            title: this.editSurveyName,
            description: this.editSurveyDescription,
            path: this.editSurveyPath,
            plannedEndDate: this.editSurveyPlannedEndDate || null,
          };
          this.$emit('save', updatedSurvey);
        }
      },
      setPath(path) {
        this.editSurveyPath = path;
        this.validateForm();
      },
    },
  };
  </script>
  
  <style scoped>
  @import '@/assets/styles/surveyStyles.css';
  </style>