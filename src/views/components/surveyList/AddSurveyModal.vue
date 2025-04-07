<!-- src/components/AddSurveyModal.vue -->
<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <h5>Yeni Anket Ekle</h5>
        <div class="form-group">
          <label>Anket Adı <span class="required">*</span></label>
          <input
            v-model="newSurveyName"
            type="text"
            class="form-control mb-3"
            :class="{ 'is-invalid': addFormErrors.surveyName }"
            placeholder="Anket Adı"
            @input="validateForm"
          />
          <div v-if="addFormErrors.surveyName" class="invalid-feedback">
            Anket adı zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Açıklama</label>
          <textarea
            v-model="newSurveyDescription"
            class="form-control mb-3"
            placeholder="Açıklama"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Dosya Yolu <span class="required">*</span></label>
          <div class="input-group mb-3">
            <input
              v-model="newSurveyPath"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': addFormErrors.surveyPath }"
              placeholder="Dosya Yolu"
              readonly
            />
            <button class="btn btn-outline-secondary" @click="$emit('open-folder-dialog')">
              Klasör Seç
            </button>
          </div>
          <div v-if="addFormErrors.surveyPath" class="invalid-feedback">
            Dosya yolu zorunludur
          </div>
        </div>
        <div class="form-group">
          <label>Planlanan Bitiş Tarihi <span class="required">*</span></label>
          <input
            v-model="newSurveyPlannedEndDate"
            type="date"
            class="form-control mb-3"
            :class="{ 'is-invalid': addFormErrors.surveyDate }"
            @input="validateForm"
          />
          <div v-if="addFormErrors.surveyDate" class="invalid-feedback">
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
    data() {
      return {
        newSurveyName: '',
        newSurveyDescription: '',
        newSurveyPath: '',
        newSurveyPlannedEndDate: '',
        addFormErrors: {
          surveyName: false,
          surveyPath: false,
          surveyDate: false,
        },
        isFormValid: false,
      };
    },
    methods: {
      validateForm() {
        this.addFormErrors = {
          surveyName: !this.newSurveyName.trim(),
          surveyPath: !this.newSurveyPath.trim(),
          surveyDate: !this.newSurveyPlannedEndDate,
        };
        this.isFormValid = !Object.values(this.addFormErrors).some(error => error);
      },
      save() {
        this.validateForm();
        if (this.isFormValid) {
          const survey = {
            id: 0,
            isDeleted: false,
            isActive: true,
            title: this.newSurveyName,
            description: this.newSurveyDescription,
            path: this.newSurveyPath,
            plannedEndDate: this.newSurveyPlannedEndDate || null,
          };
          this.$emit('save', survey);
          this.resetForm();
        }
      },
      resetForm() {
        this.newSurveyName = '';
        this.newSurveyDescription = '';
        this.newSurveyPath = '';
        this.newSurveyPlannedEndDate = '';
        this.addFormErrors = { surveyName: false, surveyPath: false, surveyDate: false };
        this.isFormValid = false;
      },
      setPath(path) {
        this.newSurveyPath = path;
        this.validateForm();
      },
    },
  };
  </script>
  
  <style scoped>
  @import '@/assets/styles/surveyStyles.css';
  </style>