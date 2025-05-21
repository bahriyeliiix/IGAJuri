<template>
    <aside class="w-64 fixed h-full bg-white border-r border-gray-200 p-4">
      <h2 class="text-xl font-semibold mb-6">Anket Oluştur</h2>
  
      <button
        @click="$emit('add-page')"
        class="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 px-4 rounded-md mb-3"
      >
        + Sayfa Ekle
      </button>
  
      <button
        @click="$emit('add-question')"
        class="bg-green-600 hover:bg-green-700 text-white w-full py-2 px-4 rounded-md mb-3"
      >
        + Soru Ekle
      </button>
  
      <button
        @click="$emit('toggle-preview')"
        class="bg-purple-600 hover:bg-purple-700 text-white w-full py-2 px-4 rounded-md"
      >
        {{ isPreview ? 'Düzenle' : 'Önizleme' }}
      </button>
    </aside>
  </template>
  
  <script setup>
  defineProps({
    isPreview: Boolean
  })
  </script>
  
  <style scoped>
  /* Container */
  .container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
  }
  
  /* Card */
  .card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    width: 100%;
    background-color: #fff;
  }
  
  /* Card Header */
  .card-header {
    background-color: #f9fafb;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 12px 12px 0 0;
    text-align: left;
  }
  
  /* Form Group */
  .form-group {
    margin-bottom: 1rem;
  }
  
  /* Form Control */
  .form-control {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #f9fafb;
  }
  
  /* Button */
  .btn {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
  
  /* Primary Button */
  .btn-primary {
    background-color: #4c6ef5;
    border: none;
    color: #fff;
  }
  .btn-primary:hover {
    background-color: #3b82f6;
  }
  
  </style>