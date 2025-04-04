<template>
    <div class="tree-node-container">
      <div
        class="tree-node"
        :class="{ 'has-children': hasChildren }"
        :style="{ 'padding-left': depth * 15 + 'px' }"
      >
        <span v-if="hasChildren" class="toggle-icon" @click="toggleExpand">
          <i :class="expanded ? 'fas fa-folder-open' : 'fas fa-folder'"></i>
          <span class="arrow-icon">{{ expanded ? '▼' : '▶' }}</span>
        </span>
        <span v-else class="file-icon">
          <i class="fas fa-file"></i>
        </span>
        <span
          class="folder-name"
          @click="selectFolder"
          :class="{ 'is-folder': hasChildren }"
        >
          {{ node.name }}
        </span>
      </div>
      <div v-if="expanded && hasChildren" class="tree-children">
        <tree-node
          v-for="child in node.subFolders"
          :key="child.path"
          :node="child"
          :depth="depth + 1"
          @select-folder="$emit('select-folder', $event)"
        ></tree-node>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TreeNode',
    props: {
      node: {
        type: Object,
        required: true,
      },
      depth: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        expanded: false,
      };
    },
    computed: {
      hasChildren() {
        return this.node.subFolders && this.node.subFolders.length > 0;
      },
    },
    methods: {
      toggleExpand() {
        if (this.hasChildren) {
          this.expanded = !this.expanded;
        }
      },
      selectFolder() {
        this.$emit('select-folder', this.node.path);
      },
    },
  };
  </script>
  
  <style scoped>
  .tree-node-container {
    margin-left: 0;
  }
  
  .tree-node {
    display: flex;
    align-items: center;
    padding: 8px 0;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .tree-node:hover {
    background-color: #f5f7fa;
    border-radius: 4px;
  }
  
  .toggle-icon {
    display: flex;
    align-items: center;
    margin-right: 8px;
    color: #f6c453;
    position: relative;
  }
  
  .arrow-icon {
    font-size: 10px;
    color: #6b7280;
    margin-left: 5px;
  }
  
  .file-icon {
    margin-right: 8px;
    color: #9ca3af;
    width: 16px;
    display: inline-block;
    text-align: center;
  }
  
  .folder-name {
    font-size: 0.9rem;
    color: #374151;
    padding: 2px 5px;
    border-radius: 3px;
    flex-grow: 1;
  }
  
  .folder-name.is-folder {
    font-weight: 500;
    color: #1e40af;
  }
  
  .folder-name:hover {
    background-color: #e5e7eb;
  }
  
  .tree-children {
    margin-left: 0;
    border-left: 1px dashed #d1d5db;
    margin-left: 12px;
    padding-left: 8px;
  }
  
  .fa-folder, .fa-folder-open {
    font-size: 16px;
    margin-right: 5px;
  }
  
  .fa-file {
    font-size: 14px;
  }
  </style>