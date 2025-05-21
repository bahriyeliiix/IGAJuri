<template>
    <div class="mb-4">
      <label v-if="label" class="block text-gray-700 font-medium mb-2">
        {{ label }}
      </label>
      <input
        type="file"
        :accept="accept"
        @change="handleFileChange"
        class="w-full text-gray-700 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
      <div v-if="fileName" class="mt-2 text-gray-600">
        Yüklenen dosya: <strong>{{ fileName }}</strong>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  defineProps({
    modelValue: {
      type: Object,
      default: null
    },
    label: String,
    accept: String,
    error: String
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const fileName = ref('')
  
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      fileName.value = file.name
      emit('update:modelValue', file)
    }
  }
  </script>
  
  <style scoped>
  </style>
  