<template>
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4.5 5.5L7 3L9.5 5.5"
      stroke="currentColor"
      stroke-width="1.3"
      stroke-linecap="round"
      stroke-linejoin="round"
      :opacity="direction === 'desc' ? 0.25 : 1"
    />
    <path
      d="M4.5 8.5L7 11L9.5 8.5"
      stroke="currentColor"
      stroke-width="1.3"
      stroke-linecap="round"
      stroke-linejoin="round"
      :opacity="direction === 'asc' ? 0.25 : 1"
    />
  </svg>
</template>

<script setup>
defineProps({
  direction: { type: String, default: null }, // null | 'asc' | 'desc'
})
</script>
