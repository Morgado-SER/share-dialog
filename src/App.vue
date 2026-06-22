<template>
  <div class="prototype-shell">
    <header class="prototype-header">
      <span class="prototype-badge">Prototype</span>
      <span class="prototype-title">Share Dialog</span>
    </header>

    <main class="prototype-stage">
      <ShareDialog
        item-name="Project Alpha — Q3 Report"
        :recipients="recipients"
        @close="handleClose"
        @cancel="handleCancel"
        @done="handleDone"
        @search="handleSearch"
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ShareDialog from './components/ShareDialog.vue'

const recipients = ref([])

function handleClose() {
  console.log('Dialog closed')
}

function handleCancel() {
  console.log('Cancelled')
}

function handleDone() {
  console.log('Done — recipients:', recipients.value)
}

function handleSearch(query) {
  console.log('Search:', query)
}
</script>

<style scoped>
.prototype-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.prototype-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--color-neutral-800);
  border-bottom: 1px solid var(--color-neutral-700);
  flex-shrink: 0;
}

.prototype-badge {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-brand-300);
  background: rgba(5, 36, 116, 0.4);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.prototype-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-300);
}

.prototype-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--color-bg-page);
}
</style>
