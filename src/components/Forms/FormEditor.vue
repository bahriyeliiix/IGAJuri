<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-cream">
    <!-- Sidebar (Desktop) -->
    <aside class="sidebar hidden md:block w-64 p-6 fixed h-full bg-cream border-r border-charcoal-light">
      <h2 class="text-xl font-bold text-charcoal mb-6">Anket Oluştur</h2>
      <nav class="space-y-4">
        <button
          @click="addPage"
          class="w-full px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-dark transition-transform transform hover:scale-105"
        >
          Yeni Sayfa Ekle
        </button>
        <button
          @click="addQuestion"
          class="w-full px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-dark transition-transform transform hover:scale-105"
        >
          Yeni Soru Ekle
        </button>
        <button
          @click="togglePreview"
          class="w-full px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-dark transition-transform transform hover:scale-105"
        >
          {{ isPreview ? 'Düzenle' : 'Önizleme' }}
        </button>
      </nav>
    </aside>

    <!-- Mobile Bottom Navigation -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 bg-cream border-t border-charcoal-light p-4 flex justify-around items-center z-50"
    >
      <button
        @click="addPage"
        class="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-dark transition-transform transform hover:scale-105"
        aria-label="Yeni Sayfa Ekle"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <button
        @click="addQuestion"
        class="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-dark transition-transform transform hover:scale-105"
        aria-label="Yeni Soru Ekle"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        @click="togglePreview"
        class="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-dark transition-transform transform hover:scale-105"
        aria-label="Önizleme/Düzenle"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 md:ml-64 p-4 md:p-8">
      <div class="form-container max-w-3xl mx-auto bg-cream rounded-lg shadow-md p-6">
        <!-- Edit Mode -->
        <div v-if="!isPreview" class="space-y-6">
          <header class="space-y-4">
            <input
              v-model="form.title"
              class="w-full text-3xl font-bold text-charcoal border-b border-charcoal-light p-2 focus:outline-none focus:ring-2 focus:ring-orange"
              placeholder="Anket Başlığı"
              aria-label="Anket Başlığı"
            />
            <textarea
              v-model="form.description"
              class="w-full text-charcoal-light border border-charcoal-light p-3 rounded-md bg-cream focus:outline-none focus:ring-2 focus:ring-orange resize-y"
              placeholder="Anket Açıklaması"
              rows="4"
              aria-label="Anket Açıklaması"
            ></textarea>
          </header>

          <section v-for="(page, pageIndex) in form.pages" :key="pageIndex" class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-semibold text-charcoal">Sayfa {{ pageIndex + 1 }}</h3>
              <button
                @click="removePage(pageIndex)"
                class="text-red hover:text-red-dark transition-colors"
                aria-label="Sayfayı Sil"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div
              v-for="(question, qIndex) in page.questions"
              :key="qIndex"
              class="question-card p-4 bg-cream border border-charcoal-light rounded-lg shadow-sm"
            >
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row justify-between gap-4">
                  <input
                    v-model="question.title"
                    class="flex-1 text-lg font-medium text-charcoal p-2 focus:outline-none focus:ring-2 focus:ring-orange"
                    placeholder="Soru Başlığı"
                    aria-label="Soru Başlığı"
                  />
                  <select
                    v-model="question.type"
                    class="border border-charcoal-light p-2 rounded-md bg-cream text-charcoal focus:ring-2 focus:ring-orange"
                    @change="resetQuestionResponses(question)"
                    aria-label="Soru Tipi"
                  >
                    <option value="text">Kısa Yanıt</option>
                    <option value="multiple_choice">Çoktan Seçmeli</option>
                    <option value="checkbox">Onay Kutusu</option>
                    <option value="dropdown">Açılır Liste</option>
                    <option value="file">Dosya Yükleme</option>
                  </select>
                </div>
                <textarea
                  v-model="question.description"
                  class="w-full text-sm text-charcoal-light p-2 border border-charcoal-light rounded-md bg-cream focus:outline-none focus:ring-2 focus:ring-orange resize-y"
                  placeholder="Soru Açıklaması (opsiyonel)"
                  rows="3"
                  aria-label="Soru Açıklaması"
                ></textarea>
                <component
                  :is="getComponentType(question.type)"
                  v-model="question.response"
                  :label="question.title"
                  :options="question.options"
                  :accept="question.accept"
                  :error="question.error"
                />
                <button
                  @click="removeQuestion(pageIndex, qIndex)"
                  class="text-red hover:text-red-dark transition-colors"
                  aria-label="Soruyu Sil"
                >
                  Soruyu Sil
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- Preview Mode -->
        <div v-else class="space-y-6">
          <header class="space-y-4">
            <h1 class="text-3xl font-bold text-charcoal">{{ form.title }}</h1>
            <p class="text-charcoal-light">{{ form.description }}</p>
          </header>
          <section v-for="(page, pageIndex) in form.pages" :key="pageIndex" class="space-y-4">
            <h3 class="text-xl font-semibold text-charcoal">Sayfa {{ pageIndex + 1 }}</h3>
            <div
              v-for="(question, qIndex) in page.questions"
              :key="qIndex"
              class="question-card p-4 bg-cream border border-charcoal-light rounded-lg shadow-sm"
            >
              <h4 class="text-lg font-medium text-charcoal">{{ question.title }}</h4>
              <p v-if="question.description" class="text-sm text-charcoal-light mb-2">
                {{ question.description }}
              </p>
              <component
                :is="getComponentType(question.type)"
                v-model="question.response"
                :label="question.title"
                :options="question.options"
                :accept="question.accept"
                :error="question.error"
              />
            </div>
          </section>
          <div class="mt-6 flex justify-end">
            <button
              @click="submitForm"
              class="px-6 py-2 bg-orange text-white rounded-lg hover:bg-orange-dark transition-transform transform hover:scale-105"
              :disabled="isSubmitting"
              aria-label="Formu Gönder"
            >
              <span v-if="isSubmitting">Gönderiliyor...</span>
              <span v-else>Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputText from './inputs/InputText.vue'
import InputCheckbox from './inputs/InputCheckbox.vue'
import InputMultipleChoice from './inputs/InputMultipleChoice.vue'
import InputDropdown from './inputs/InputDropdown.vue'
import InputFile from './inputs/InputFile.vue'

const form = ref({
  title: 'Örnek Anket',
  description: 'Bu bir örnek anket formudur. Soruları doldurun.',
  pages: [
    {
      questions: [
        {
          title: 'Adınız nedir?',
          type: 'text',
          description: '',
          response: '',
        },
        {
          title: 'Hangi programlama dillerini biliyorsunuz?',
          type: 'checkbox',
          description: 'Birden fazla seçebilirsiniz.',
          options: ['JavaScript', 'Python', 'Java'],
          response: [],
        },
        {
          title: 'En sevdiğiniz renk nedir?',
          type: 'multiple_choice',
          description: '',
          options: ['Mavi', 'Yeşil', 'Kırmızı'],
          response: '',
        },
        {
          title: 'Şehir seçiniz',
          type: 'dropdown',
          description: '',
          options: ['İstanbul', 'Ankara', 'İzmir'],
          response: '',
        },
        {
          title: 'Profil fotoğrafınızı yükleyin',
          type: 'file',
          description: '',
          response: null,
        },
      ],
    },
  ],
})

const isPreview = ref(false)
const isSubmitting = ref(false)

const addPage = () => {
  form.value.pages.push({ questions: [] })
}

const addQuestion = () => {
  const newQuestion = {
    title: 'Yeni Soru',
    type: 'text',
    description: '',
    response: '',
    options: [],
  }
  const lastPage = form.value.pages[form.value.pages.length - 1]
  lastPage.questions.push(newQuestion)
}

const removeQuestion = (pageIndex, questionIndex) => {
  if (confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
    form.value.pages[pageIndex].questions.splice(questionIndex, 1)
  }
}

const removePage = (pageIndex) => {
  if (confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
    form.value.pages.splice(pageIndex, 1)
  }
}

const resetQuestionResponses = (question) => {
  question.response = ''
}

const togglePreview = () => {
  isPreview.value = !isPreview.value
}

const submitForm = async () => {
  isSubmitting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    console.log('Form Gönderildi:', JSON.stringify(form.value, null, 2))
    alert('Form gönderildi! Cevaplar konsolda.')
  } catch (error) {
    alert('Form gönderimi başarısız oldu.')
  } finally {
    isSubmitting.value = false
  }
}

const getComponentType = (type) => {
  switch (type) {
    case 'text':
      return InputText
    case 'multiple_choice':
      return InputMultipleChoice
    case 'checkbox':
      return InputCheckbox
    case 'dropdown':
      return InputDropdown
    case 'file':
      return InputFile
    default:
      return InputText
  }
}
</script>

<style scoped>
/* Color Palette */
:root {
  --orange: #f97316; /* Primary color */
  --orange-dark: #ea580c; /* Darker shade for hover effects */
  --cream: #fafafa; /* Background */
  --charcoal: #333333; /* Text */
  --charcoal-light: #666666; /* Light text */
}

/* Custom Styles */
.form-container {
  background-color: var(--cream);
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
