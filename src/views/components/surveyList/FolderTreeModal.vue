<!-- src/components/FolderTreeModal.vue -->
<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content folder-modal">
        <div class="modal-header">
          <h5><i class="fas fa-folder-open"></i> Klasör Seçin</h5>
          <button class="close-btn" @click="$emit('close')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <folder-tree :tree-data="treeData" @select-folder="$emit('select-folder', $event)" />
        </div>
        <div class="modal-footer">
          <div class="selected-path">
            <span v-if="selectedPath">
              <i class="fas fa-check-circle"></i> Seçilen: {{ selectedPath }}
            </span>
            <span v-else class="text-muted">
              <i class="fas fa-info-circle"></i> Bir klasör seçin
            </span>
          </div>
          <button class="btn btn-secondary" @click="$emit('close')">Kapat</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import FolderTree from '../FolderTree.vue';
  
  export default {
    components: { FolderTree },
    props: {
      treeData: { type: Object, required: true },
    },
    data() {
      return {
        selectedPath: '',
      };
    },
    watch: {
      selectedPath(newVal) {
        this.$emit('select-folder', newVal);
      },
    },
  };
  </script>
  
  <style scoped>
  @import '@/assets/styles/surveyStyles.css';
  </style>