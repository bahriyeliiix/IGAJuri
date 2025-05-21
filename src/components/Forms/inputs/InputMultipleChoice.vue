<template>
    <FormQuestion :label="label">
      <div v-for="(option, index) in options" :key="index" class="flex items-center mb-2">
        <input
          type="radio"
          :id="`radio-${index}`"
          :value="option"
          :checked="modelValue === option"
          @change="$emit('update:modelValue', option)"
          class="mr-2"
        />
        <label :for="`radio-${index}`">{{ option }}</label>
      </div>
    </FormQuestion>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  import FormQuestion from '../FormQuestion.vue'
  
  defineProps({
    label: String,
    modelValue: String,
    options: Array,
  })
  
  defineEmits(['update:modelValue'])
  </script>
  