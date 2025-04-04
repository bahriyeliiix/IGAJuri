<template>
    <div class="folder-tree-container">
      <div class="folder-tree-header">
        <i class="fas fa-folder-tree"></i>
        <h5>Klasör Yapısı</h5>
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Klasör ara..."
            class="search-input"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>
      <div class="folder-tree-body">
        <div v-if="!treeData" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Klasörler yükleniyor...</span>
        </div>
        <div v-else-if="filteredTreeData" class="tree-scroll-container">
          <tree-node
            :node="filteredTreeData"
            @select-folder="handleFolderSelect"
          ></tree-node>
        </div>
        <div v-else class="no-results">
          <i class="fas fa-exclamation-circle"></i>
          <span>Eşleşen klasör bulunamadı</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import TreeNode from './TreeNode.vue';
  
  export default {
    components: {
      TreeNode,
    },
    props: {
      treeData: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        searchQuery: '',
      };
    },
    computed: {
      filteredTreeData() {
        if (!this.searchQuery || !this.treeData) return this.treeData;
        return this.filterTree(this.treeData, this.searchQuery.toLowerCase());
      },
    },
    methods: {
      handleFolderSelect(path) {
        this.$emit('select-folder', path);
      },
      filterTree(node, query) {
        if (node.name.toLowerCase().includes(query)) {
          return node;
        }
        
        if (node.subFolders && node.subFolders.length > 0) {
          const filteredChildren = node.subFolders
            .map(child => this.filterTree(child, query))
            .filter(child => child !== null);
          
          if (filteredChildren.length > 0) {
            return {
              ...node,
              subFolders: filteredChildren,
              expanded: true
            };
          }
        }
        
        return null;
      },
    },
  };
  </script>
  
  <style scoped>
  .folder-tree-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .folder-tree-header {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    padding: 12px 15px;
    display: flex;
    align-items: center;
  }
  
  .folder-tree-header h5 {
    margin: 0 0 0 10px;
    font-size: 1rem;
    font-weight: 600;
  }
  
  .fa-folder-tree {
    font-size: 18px;
  }
  
  .search-box {
    position: relative;
    margin-left: auto;
    width: 200px;
  }
  
  .search-input {
    width: 100%;
    padding: 6px 10px 6px 30px;
    border-radius: 20px;
    border: none;
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 0.85rem;
  }
  
  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .search-input:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .folder-tree-body {
    background-color: white;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .loading, .no-results {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #6b7280;
  }
  
  .loading i, .no-results i {
    margin-right: 8px;
  }
  
  .tree-scroll-container {
    padding: 10px;
  }
  
  .fa-spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  </style>