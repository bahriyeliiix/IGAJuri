<template>
    <div class="mb-4">
      <label v-if="label" class="block text-gray-700 font-medium mb-2">
        {{ label }}
      </label>
      <div v-for="(option, index) in options" :key="index" class="flex items-center mb-2">
        <input
          type="checkbox"
          :id="`checkbox-${index}`"
          :value="option"
          v-model="internalValue"
          class="mr-2"
        />
        <label :for="`checkbox-${index}`" class="text-gray-700">
          {{ option }}
        </label>
      </div>
      <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    modelValue: Array,
    label: String,
    options: Array,
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
  