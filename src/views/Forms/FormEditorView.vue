<template>
  <div class="min-h-screen flex flex-col bg-primary font-sans">
    <!-- Mobile Header -->
    <header class="md:hidden sticky top-0 z-50 bg-primary border-b border-white p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-white">Anket Oluştur</h1>
      <button @click="toggleSidebar" class="p-2 text-white" aria-label="Menüyü Aç/Kapa">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>

    <!-- Sidebar (Mobile: Collapsible, Desktop: Fixed) -->
    <aside
      :class="[
        'sidebar fixed inset-y-0 left-0 z-40 w-72 bg-secondary border-r border-white p-6 transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:block'
      ]"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-white hidden md:block">Anket Oluştur</h2>
        <button @click="toggleSidebar" class="md:hidden p-2 text-white" aria-label="Menüyü Kapat">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="space-y-6">
        <button
          @click="addPage"
          class="w-full px-6 py-3 bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all transform"
          aria-label="Yeni Sayfa Ekle"
        >
          Yeni Sayfa Ekle
        </button>
        <button
          @click="addQuestion"
          class="w-full px-6 py-3 bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all transform"
          aria-label="Yeni Soru Ekle"
        >
          Yeni Soru Ekle
        </button>
        <button
          @click="togglePreview"
          class="w-full px-6 py-3 bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all transform"
          aria-label="Önizleme/Düzenle"
        >
          {{ isPreview ? 'Düzenle' : 'Önizleme' }}
        </button>
      </nav>
    </aside>

    <!-- Overlay for Mobile Sidebar -->
    <div
      v-if="isSidebarOpen"
      class="md:hidden fixed inset-0 bg-black bg-opacity-60 z-30"
      @click="toggleSidebar"
    ></div>

    <!-- Main Content -->
    <main class="flex-1 p-6 md:p-12 md:ml-72">
      <div class="form-container bg-gradient-to-br from-teal-100 to-blue-50 rounded-xl shadow-2xl p-8 md:p-12">
        <!-- Edit Mode -->
        <div v-if="!isPreview" class="space-y-8">
          <header class="space-y-4">
            <input
              v-model="form.title"
              class="w-full text-3xl md:text-4xl font-bold text-text-primary bg-transparent border-b-4 border-blue-500 p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              placeholder="Anket Başlığı"
              aria-label="Anket Başlığı"
            />
            <textarea
              v-model="form.description"
              class="w-full text-text-secondary border-2 border-blue-200 p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y transition-all"
              placeholder="Anket Açıklaması"
              rows="4"
              aria-label="Anket Açıklaması"
            ></textarea>
          </header>

          <section v-for="(page, pageIndex) in form.pages" :key="pageIndex" class="space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-2xl font-semibold text-text-primary">Sayfa {{ pageIndex + 1 }}</h3>
              <button
                @click="removePage(pageIndex)"
                class="text-red-600 hover:text-red-800 transition-all"
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
              class="question-card p-6 bg-gradient-to-br from-white to-teal-50 border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-all"
            >
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row justify-between gap-4">
                  <input
                    v-model="question.title"
                    class="flex-1 text-lg font-medium text-text-primary bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Soru Başlığı"
                    aria-label="Soru Başlığı"
                  />
                  <select
                    v-model="question.type"
                    class="border border-gray-300 p-2 rounded-lg bg-white text-text-primary focus:ring-2 focus:ring-blue-300"
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
                  class="w-full text-sm text-text-secondary p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
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
                  class="text-red-600 hover:text-red-800 transition-all"
                  aria-label="Soruyu Sil"
                >
                  Soruyu Sil
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- Preview Mode -->
        <div v-else class="space-y-8">
          <header class="space-y-4">
            <h1 class="text-3xl md:text-4xl font-bold text-text-primary">{{ form.title }}</h1>
            <p class="text-text-secondary leading-relaxed">{{ form.description }}</p>
          </header>
          <section v-for="(page, pageIndex) in form.pages" :key="pageIndex" class="space-y-6">
            <h3 class="text-2xl font-semibold text-text-primary">Sayfa {{ pageIndex + 1 }}</h3>
            <div
              v-for="(question, qIndex) in page.questions"
              :key="qIndex"
              class="question-card p-6 bg-gradient-to-br from-white to-teal-50 border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-all"
            >
              <h4 class="text-lg font-medium text-text-primary">{{ question.title }}</h4>
              <p v-if="question.description" class="text-sm text-text-secondary mb-2">
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
          <div class="mt-8 flex justify-end">
            <button
              @click="submitForm"
              class="px-6 py-3 bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all transform flex items-center gap-2"
              :disabled="isSubmitting"
              aria-label="Formu Gönder"
            >
              <span v-if="isSubmitting" class="animate-spin">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 12a8 8 0 0116 0 8 8 0 01-16 0"
                  />
                </svg>
              </span>
              <span>{{ isSubmitting ? 'Gönderiliyor...' : 'Gönder' }}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputText from '../../components/Forms/inputs/InputText.vue'
import InputCheckbox from '../../components/Forms/inputs/InputCheckbox.vue'
import InputMultipleChoice from '../../components/Forms/inputs/InputMultipleChoice.vue'
import InputDropdown from '../../components/Forms/inputs/InputDropdown.vue'
import InputFile from '../../components/Forms/inputs/InputFile.vue'

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
const isSidebarOpen = ref(false)

const addPage = () => {
  form.value.pages.push({ questions: [] })
  showToast('Yeni sayfa eklendi!')
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
  showToast('Yeni soru eklendi!')
}

const removeQuestion = (pageIndex, questionIndex) => {
  if (confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
    form.value.pages[pageIndex].questions.splice(questionIndex, 1)
    showToast('Soru silindi.')
  }
}

const removePage = (pageIndex) => {
  if (confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
    form.value.pages.splice(pageIndex, 1)
    showToast('Sayfa silindi.')
  }
}

const resetQuestionResponses = (question) => {
  question.response = ''
}

const togglePreview = () => {
  isPreview.value = !isPreview.value
  showToast(isPreview.value ? 'Önizleme moduna geçildi.' : 'Düzenleme moduna geçildi.')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const submitForm = async () => {
  isSubmitting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    console.log('Form Gönderildi:', JSON.stringify(form.value, null, 2))
    showToast('Form başarıyla gönderildi!')
  } catch (error) {
    console.error('Form gönderim hatası:', error)
    showToast('Bir hata oluştu!')
  } finally {
    isSubmitting.value = false
  }
}

const showToast = (message) => {
  alert(message) // Placeholder for toast notifications
}

const getComponentType = (type) => {
  switch (type) {
    case 'text':
      return InputText
    case 'checkbox':
      return InputCheckbox
    case 'multiple_choice':
      return InputMultipleChoice
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
.bg-primary {
  background-color: #1e293b; /* Dark blue */
}

.bg-secondary {
  background-color: #0f172a; /* Darker blue */
}

.bg-text-primary {
  color: #0f172a;
}

.bg-text-secondary {
  color: #64748b; /* Grayish text */
}
</style>
