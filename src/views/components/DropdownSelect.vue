<template>
    <div class="dropdown-container mb-4">
      <select v-model="selected" @change="$emit('change')" class="custom-dropdown">
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: String,
      options: Array,
      placeholder: String,
    },
    computed: {
      selected: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit("input", value);
        },
      },
    },
  };
  </script>