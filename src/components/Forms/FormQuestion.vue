<template>
  <div class="form-question">
    <label :for="label" class="font-medium text-charcoal">{{ label }}</label>
    <div class="mt-2">
      <slot></slot> <!-- Diğer bileşenlere içerik aktarımı için slot -->
    </div>
  </div>
</template>

<script setup>
defineProps({
label: String,
})
</script>

<style scoped>
/* Color Palette */
:root {
--primary: #e11d48; /* Primary color */
--primary-dark: #be123c; /* Hover state */
--secondary: #fef3c7; /* Light variant for secondary buttons */
--text-primary: #1e1b4b; /* Text and borders */
--text-secondary: #57534e; /* Secondary text */
--danger: #dc2626; /* Delete button */
--danger-dark: #b91c1c; /* Delete button hover */
}

.form-question {
margin-bottom: 24px;
}

label {
color: var(--text-primary);
}
</style>