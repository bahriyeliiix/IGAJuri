<template>
    <div class="mb-4">
      <label v-if="label" class="block text-gray-700 font-medium mb-2">
        {{ label }}
      </label>
      <select
        v-model="internalValue"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option disabled value="">{{ placeholder }}</option>
        <option v-for="(option, index) in options" :key="index" :value="option">
          {{ option }}
        </option>
      </select>
      <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    modelValue: String,
    label: String,
    options: Array,
    placeholder: String,
    error: String
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const internalValue = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })
  </script>
  
  <style scoped>
  </style>
  