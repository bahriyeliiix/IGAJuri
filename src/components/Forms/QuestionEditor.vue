<template>
  <div class="question-card p-4 mb-4 border rounded-md bg-cream shadow-sm">
    <!-- Soru Başlığı ve Tipi -->
    <div class="flex justify-between items-center mb-2">
      <input
        v-model="localQuestion.title"
        class="w-full text-lg font-medium text-charcoal p-2 focus:outline-none focus:ring-2 focus:ring-orange"
        placeholder="Soru Başlığı"
      />
      <select
        v-model="localQuestion.type"
        class="border border-charcoal-light p-2 rounded-md ml-4 bg-cream text-charcoal focus:ring-2 focus:ring-orange"
        @change="resetQuestionResponses"
      >
        <option value="text">Kısa Yanıt</option>
        <option value="multiple_choice">Çoktan Seçmeli</option>
        <option value="checkbox">Onay Kutusu</option>
        <option value="dropdown">Açılır Liste</option>
        <option value="file">Dosya Yükleme</option>
      </select>
    </div>

    <!-- Soru Açıklaması -->
    <textarea
      v-model="localQuestion.description"
      class="w-full text-sm text-charcoal-light p-2 border border-charcoal-light rounded-md bg-cream focus:outline-none focus:ring-2 focus:ring-orange"
      placeholder="Soru Açıklaması (opsiyonel)"
    ></textarea>

    <!-- Seçenekler -->
    <div v-if="['multiple_choice', 'checkbox', 'dropdown'].includes(localQuestion.type)" class="mt-2">
      <div
        v-for="(option, optIndex) in localQuestion.options"
        :key="optIndex"
        class="flex items-center mt-2"
      >
        <input
          v-model="localQuestion.options[optIndex]"
          class="w-full p-2 border border-charcoal-light rounded-md bg-cream text-charcoal focus:ring-2 focus:ring-orange"
          placeholder="Seçenek"
        />
        <button @click="removeOption(optIndex)" class="ml-2 text-red-600 hover:text-red-800">Sil</button>
      </div>
      <button @click="addOption" class="text-orange hover:text-orange-dark mt-2">+ Seçenek Ekle</button>
    </div>

    <!-- Medya Yükleme -->
    <div class="mt-4 space-y-2">
      <input type="file" @change="handleMediaUpload($event, 'image')" accept="image/*" class="text-charcoal" />
      <input type="file" @change="handleMediaUpload($event, 'video')" accept="video/*" class="text-charcoal" />
      <input type="file" @change="handleMediaUpload($event, 'audio')" accept="audio/*" class="text-charcoal" />
    </div>

    <!-- Medya Önizleme -->
    <div v-if="localQuestion.media.image" class="mt-2">
      <img :src="localQuestion.media.image" class="max-w-xs rounded shadow" />
    </div>
    <div v-if="localQuestion.media.video" class="mt-2">
      <video controls class="max-w-xs">
        <source :src="localQuestion.media.video" />
      </video>
    </div>
    <div v-if="localQuestion.media.audio" class="mt-2">
      <audio controls>
        <source :src="localQuestion.media.audio" />
      </audio>
    </div>

    <!-- Silme Butonu -->
    <button @click="emit('remove')" class="text-red-600 hover:text-red-800 mt-4">Soruyu Sil</button>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  question: Object,
  pageIndex: Number,
  questionIndex: Number,
})
const emit = defineEmits(['remove', 'update'])

const localQuestion = reactive({
  ...props.question,
  media: props.question.media || {
    image: null,
    video: null,
    audio: null,
  },
})

watch(localQuestion, () => {
  emit('update', localQuestion)
}, { deep: true })

function resetQuestionResponses() {
  localQuestion.response = ''
  localQuestion.responses = []
  if (['multiple_choice', 'checkbox', 'dropdown'].includes(localQuestion.type)) {
    localQuestion.options = localQuestion.options.length ? localQuestion.options : ['Seçenek 1']
  } else {
    localQuestion.options = []
  }
}

function addOption() {
  localQuestion.options.push(`Seçenek ${localQuestion.options.length + 1}`)
}

function removeOption(index) {
  localQuestion.options.splice(index, 1)
}

function handleMediaUpload(event, type) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    localQuestion.media[type] = reader.result
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
/* Color Palette */
:root {
  --orange: #f97316; /* Primary color */
  --orange-dark: #c2410c; /* Hover state */
  --orange-light: #fed7aa; /* Light variant for secondary buttons */
  --cream: #fff7ed; /* Backgrounds */
  --charcoal: #1f2937; /* Text and borders */
  --charcoal-light: #4b5563; /* Secondary text */
}

/* Input and Textarea Styles */
input,
textarea,
select {
  transition: border-color 0.3s ease, ring 0.3s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--orange);
}

/* Button Styles */
button {
  transition: color 0.3s ease;
}

/* Card Styles */
.question-card {
  border-color: var(--charcoal-light);
}
</style>