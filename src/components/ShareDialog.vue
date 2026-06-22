<template>
  <div class="share-dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId">
    <!-- ── Header ── -->
    <div class="share-dialog__header">
      <div class="share-dialog__header-inner">
        <h2 :id="titleId" class="share-dialog__title">
          Share <span class="share-dialog__item-name">{{ itemName }}</span>
        </h2>
        <button
          class="share-dialog__close"
          type="button"
          aria-label="Close dialog"
          @click="emit('close')"
        >
          <IconClose />
        </button>
      </div>
      <p class="share-dialog__subtitle">
        Share this item with people, groups, units, or roles.
      </p>
    </div>

    <!-- ── Body ── -->
    <div class="share-dialog__body">
      <!-- Search field -->
      <div class="share-dialog__search">
        <label :for="inputId" class="share-dialog__label">
          Search people, groups, units, or roles
        </label>
        <input
          :id="inputId"
          v-model="searchQuery"
          type="text"
          class="share-dialog__input"
          placeholder="Search by name or email"
          autocomplete="off"
          @input="emit('search', searchQuery)"
        />
      </div>

      <!-- Recipient list area -->
      <div class="share-dialog__list-area" aria-live="polite" aria-atomic="true">
        <!-- Empty state -->
        <div v-if="recipients.length === 0" class="share-dialog__empty">
          <div class="share-dialog__empty-icon" aria-hidden="true">
            <IconUser />
          </div>
          <div class="share-dialog__empty-text">
            <p class="share-dialog__empty-title">No recipients added yet</p>
            <p class="share-dialog__empty-body">
              Search for people, groups, units,<br />or roles to grant access.
            </p>
          </div>
        </div>

        <!-- Recipient list (populated state — placeholder) -->
        <!-- TODO: render recipient rows when recipients.length > 0 -->
      </div>
    </div>

    <!-- ── Footer ── -->
    <div class="share-dialog__footer">
      <button
        type="button"
        class="share-dialog__btn share-dialog__btn--secondary"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="button"
        class="share-dialog__btn share-dialog__btn--primary"
        @click="emit('done')"
      >
        Done
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import IconClose from './icons/IconClose.vue'
import IconUser from './icons/IconUser.vue'

const props = defineProps({
  /** Display name of the item being shared */
  itemName: {
    type: String,
    default: '[name of task, doc, e-file]',
  },
  /** Current list of added recipients */
  recipients: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'cancel', 'done', 'search'])

const searchQuery = ref('')

// Stable IDs for accessibility
const uid = Math.random().toString(36).slice(2, 8)
const titleId = computed(() => `share-dialog-title-${uid}`)
const inputId = computed(() => `share-dialog-search-${uid}`)
</script>

<style scoped>
/* ── Shell ── */
.share-dialog {
  display: flex;
  flex-direction: column;
  width: 440px;
  background: var(--color-neutral-0);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

/* ── Header ── */
.share-dialog__header {
  flex-shrink: 0;
}

.share-dialog__header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 20px 20px 4px;
}

.share-dialog__title {
  font-size: 20px;
  font-weight: var(--weight-medium);
  line-height: 1;
  color: var(--color-brand-600);
  flex: 1;
}

.share-dialog__item-name {
  font-weight: inherit;
}

.share-dialog__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--color-neutral-700);
  border-radius: var(--radius-sm);
  transition: color var(--transition-default), background var(--transition-default);
}

.share-dialog__close:hover {
  color: var(--color-brand-600);
  background: var(--color-brand-50);
}

.share-dialog__subtitle {
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: 20px;
  color: var(--color-neutral-500);
  padding: 8px 20px 0;
}

/* ── Body ── */
.share-dialog__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 24px;
  padding-bottom: 20px;
  min-height: 0;
}

/* ── Search ── */
.share-dialog__search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 20px;
  flex-shrink: 0;
}

.share-dialog__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: 1;
  color: var(--color-neutral-700);
}

.share-dialog__input {
  width: 100%;
  height: 40px;
  padding: 3px 3px 3px 8px;
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--weight-normal);
  color: var(--color-neutral-700);
  outline: none;
  transition: border-color var(--transition-default), box-shadow var(--transition-default);
}

.share-dialog__input::placeholder {
  color: var(--color-neutral-400);
}

.share-dialog__input:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(5, 36, 116, 0.12);
}

/* ── List area ── */
.share-dialog__list-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 124px 10px;
  width: 100%;
}

/* ── Empty state ── */
.share-dialog__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: 0 64px;
  text-align: center;
}

.share-dialog__empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-neutral-50);
  border-radius: var(--radius-full);
  color: var(--color-neutral-400);
  flex-shrink: 0;
}

.share-dialog__empty-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.share-dialog__empty-title {
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 16px;
  color: var(--color-neutral-700);
}

.share-dialog__empty-body {
  font-size: 12px;
  font-weight: var(--weight-normal);
  line-height: 16px;
  color: var(--color-neutral-500);
}

/* ── Footer ── */
.share-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px 20px;
  flex-shrink: 0;
}

/* ── Buttons ── */
.share-dialog__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-width: 102px;
  padding: 0 12px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: 1;
  transition: background var(--transition-default), border-color var(--transition-default),
    color var(--transition-default);
}

.share-dialog__btn--secondary {
  background: transparent;
  border: 1px solid var(--color-brand-100);
  color: var(--color-brand-600);
}

.share-dialog__btn--secondary:hover {
  background: var(--color-brand-50);
  border-color: var(--color-brand-200);
}

.share-dialog__btn--primary {
  background: var(--color-brand-600);
  border: 1px solid var(--color-brand-600);
  color: var(--color-neutral-0);
}

.share-dialog__btn--primary:hover {
  background: var(--color-brand-700);
  border-color: var(--color-brand-700);
}
</style>
