<template>
  <div class="mb-8">
    <h3 class="text-xl font-semibold text-gray-800 mb-4">Sayfa {{ pageIndex + 1 }}</h3>

    <QuestionEditor
      v-for="(question, qIndex) in localPage.questions"
      :key="qIndex"
      :question="question"
      :page-index="pageIndex"
      :question-index="qIndex"
      @remove="() => emit('remove-question', qIndex)"
      @update="emitUpdate"
    />

    <button
      @click="emit('remove-page', pageIndex)"
      class="text-red-600 mt-2"
    >
      Sayfayı Sil
    </button>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import QuestionEditor from './QuestionEditor.vue'

const props = defineProps({
  page: Object,
  pageIndex: Number,
})

const emit = defineEmits(['remove-page', 'remove-question', 'update'])

const localPage = reactive(JSON.parse(JSON.stringify(props.page)))

watch(localPage, () => {
  emitUpdate()
}, { deep: true })

function emitUpdate() {
  emit('update', localPage)
}
</script>
