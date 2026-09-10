<template>
  <button
    type="button"
    class="suggestion-chip"
    :class="{ 'suggestion-chip--hover': hover }"
    @click="emit('select')"
  >
    <IconPlus class="suggestion-chip__icon" />
    <span class="suggestion-chip__label">{{ label }}</span>
  </button>
</template>

<script setup>
import IconPlus from './icons/IconPlus.vue'

defineProps({
  label: { type: String, required: true },
  /** Force the hover appearance — used by the component gallery */
  hover: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])
</script>

<style scoped>
.suggestion-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 6px;
  border: 1px solid #dddddd;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: background var(--transition-default);
}

.suggestion-chip:hover,
.suggestion-chip--hover,
.suggestion-chip:focus-visible {
  background: #e5e5e5;
}

.suggestion-chip__icon {
  flex-shrink: 0;
  color: #939393;
}

.suggestion-chip__label {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 0 2px;
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: 1;
  color: var(--color-neutral-500);
  white-space: nowrap;
}
</style>
