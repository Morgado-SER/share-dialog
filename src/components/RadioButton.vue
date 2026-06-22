<template>
  <button
    type="button"
    class="radio-button"
    :class="{ 'radio-button--checked': checked }"
    role="radio"
    :aria-checked="checked"
    :aria-label="label"
    @click="emit('update:checked', !checked)"
  >
    <span class="radio-button__circle">
      <span v-if="checked" class="radio-button__dot" />
    </span>
    <span v-if="showLabel" class="radio-button__label">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  checked:   { type: Boolean, default: false },
  label:     { type: String,  default: '' },
  showLabel: { type: Boolean, default: false },
})

const emit = defineEmits(['update:checked'])
</script>

<style scoped>
.radio-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.radio-button__circle {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-0);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color var(--transition-default), background var(--transition-default);
}

.radio-button--checked .radio-button__circle {
  border-color: var(--color-brand-600);
  background: var(--color-brand-600);
}

.radio-button__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-neutral-0);
}

.radio-button__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  color: var(--color-neutral-700);
}
</style>
