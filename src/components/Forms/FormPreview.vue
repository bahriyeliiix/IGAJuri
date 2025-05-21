<template>
  <div class="container py-4 py-md-5">
    <!-- Form Header -->
    <header class="text-center mb-5">
      <h2 class="display-5 fw-bold text-text-primary">{{ form.title }}</h2>
      <p class="lead text-text-secondary">{{ form.description }}</p>
    </header>

    <!-- Progress Indicator -->
    <div
      v-if="form.pages && form.pages.length > 1"
      class="progress mb-4"
      role="progressbar"
      :aria-valuenow="currentPageIndex + 1"
      aria-valuemin="1"
      :aria-valuemax="form.pages.length"
    >
      <div
        class="progress-bar bg-primary"
        :style="{ width: ((currentPageIndex + 1) / form.pages.length) * 100 + '%' }"
      >
        Sayfa {{ currentPageIndex + 1 }} / {{ form.pages.length }}
      </div>
    </div>

    <!-- Page Navigation -->
    <div
      v-if="form.pages && form.pages.length > 1"
      class="d-flex flex-column flex-md-row justify-content-between mb-5 gap-3"
    >
      <button
        v-if="currentPageIndex > 0"
        @click="currentPageIndex--"
        class="btn btn-outline-secondary w-100 w-md-auto"
        :disabled="isSubmitting"
      >
        <i class="bi bi-arrow-left me-2"></i>Önceki
      </button>
      <button
        v-if="currentPageIndex < form.pages.length - 1"
        @click="currentPageIndex++"
        class="btn btn-primary w-100 w-md-auto"
        :disabled="isSubmitting"
      >
        Sonraki<i class="bi bi-arrow-right ms-2"></i>
      </button>
    </div>

    <!-- Questions -->
    <div v-if="currentPage.questions.length" class="row g-4">
      <div
        v-for="(question, qIndex) in currentPage.questions"
        :key="qIndex"
        class="col-12"
      >
        <div class="card question-card shadow-sm">
          <div class="card-body p-4">
            <label class="card-title fw-semibold fs-4 text-text-primary mb-2">
              {{ question.title }}
            </label>
            <p v-if="question.description" class="card-text text-text-secondary mb-3">
              {{ question.description }}
            </p>
            <component
              :is="getInputComponent(question)"
              v-model="answers[question.id]"
              :question="question"
              class="form-control"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div v-if="currentPageIndex === form.pages.length - 1" class="mt-5 text-center">
      <button
        @click="submitForm"
        class="btn btn-primary btn-lg w-100 w-md-auto px-5 py-3"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {{ isSubmitting ? 'Gönderiliyor...' : 'Gönder' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Bootstrap CSS and Icons (assumed to be included in the project)
import InputText from "../../components/Forms/inputs/InputText.vue";
import InputChoice from "../../components/Forms/inputs/InputChoice.vue";
import InputCheckbox from "../../components/Forms/inputs/InputCheckbox.vue";
import InputDropdown from "../../components/Forms/inputs/InputDropdown.vue";
import InputFile from "../../components/Forms/inputs/InputFile.vue";

const props = defineProps({
  form: Object,
});

const answers = ref({});
const currentPageIndex = ref(0);
const isSubmitting = ref(false);

const currentPage = computed(() => props.form.pages[currentPageIndex.value]);

function getInputComponent(question) {
  switch (question.type) {
    case "text":
      return InputText;
    case "multiple_choice":
      return InputChoice;
    case "checkbox":
      return InputCheckbox;
    case "dropdown":
      return InputDropdown;
    case "file":
      return InputFile;
    default:
      return InputText;
  }
}

async function submitForm() {
  isSubmitting.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    console.log("Form cevapları:", answers.value);
    alert("Form başarıyla gönderildi!");
  } catch (error) {
    alert("Form gönderimi başarısız oldu.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* Color Palette */
:root {
  --primary: #ff2e63; /* Vivid pink for buttons and accents */
  --primary-dark: #d81b60; /* Darker pink for hover */
  --secondary: #f4f4f9; /* Light lavender for backgrounds */
  --text-primary: #1a1a3d; /* Deep navy for text */
  --text-secondary: #6b7280; /* Soft slate for secondary text */
  --accent: #22d3ee; /* Cyan for focus states */
}

/* Bootstrap Customizations */
body {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--secondary);
}

.container {
  max-width: 800px;
}

h2 {
  color: var(--text-primary);
}

p.lead {
  color: var(--text-secondary);
}

/* Question Card */
.question-card {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.question-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

/* Buttons */
.btn-primary {
  background-color: var(--primary);
  border-color: var(--primary);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: scale(1.05);
}

.btn-outline-secondary {
  border-color: var(--text-secondary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: var(--secondary);
  transform: scale(1.05);
}

/* Progress Bar */
.progress {
  height: 1.5rem;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.05);
}

.progress-bar {
  background-color: var(--primary);
  transition: width 0.3s ease;
}

/* Form Controls */
.form-control {
  border-radius: 8px;
  border: 1px solid var(--text-secondary);
  padding: 0.75rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 0.2rem rgba(34, 211, 238, 0.25);
}

/* Responsive Adjustments */
@media (max-width: 576px) {
  h2 {
    font-size: 1.75rem;
  }

  .btn-lg {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }

  .question-card {
    padding: 1rem;
  }
}
</style>