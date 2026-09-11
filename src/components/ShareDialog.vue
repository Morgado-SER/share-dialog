<template>
  <div
    ref="dialogRef"
    class="share-dialog"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    :aria-describedby="descId"
    tabindex="-1"
    @keydown="onDialogKeydown"
  >

    <!-- Status region — permanently in the DOM so changes are announced.
         Carries result counts and add/remove confirmations (a11y #6, #8) -->
    <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>

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
      <p :id="descId" class="share-dialog__subtitle">
        Share this item with people, groups, units, or roles.
      </p>
    </div>

    <!-- ── Body: search + results ── -->
    <div class="share-dialog__body">

      <!-- Search field — results appear in a dropdown anchored to the input -->
      <div class="share-dialog__search">
        <label :for="inputId" class="share-dialog__label">
          Search people, groups, units, or roles
        </label>

        <div ref="searchWrapRef" class="search-anchor">
          <input
            :id="inputId"
            v-model="searchQuery"
            type="text"
            class="share-dialog__input"
            :class="{ 'share-dialog__input--active': searchQuery.length > 0 }"
            placeholder="Search by name or email"
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            :aria-expanded="dropdownOpen"
            @focus="dropdownOpen = searchQuery.length > 0"
            @click="dropdownOpen = searchQuery.length > 0"
          />

          <!-- Results dropdown -->
          <div
            v-if="dropdownOpen"
            class="results-dropdown"
            role="listbox"
          >
            <button
              v-for="result in searchResults"
              :key="result.id"
              type="button"
              class="results-dropdown__option"
              :class="{ 'results-dropdown__option--disabled': result.added }"
              role="option"
              :aria-selected="false"
              :disabled="result.added"
              @click="handleAdd(result)"
            >
              <ShareItem
                type="Secondary"
                :name="result.name"
                :sub-text="result.subText"
                :tag="result.tag"
                :avatar-type="result.avatarType"
                :avatar-src="result.avatarSrc"
                :added="result.added"
                :permission-control="false"
                :hide-action="!result.added"
              />
            </button>

            <p v-if="searchResults.length === 0" class="results-dropdown__empty">
              No results for "{{ searchQuery }}"
            </p>
          </div>
        </div>
      </div>

      <!-- Suggested recipients — one click adds them, same as a dropdown row.
           Inert while the dropdown covers them, so focus can't land out of sight (a11y #5) -->
      <div
        v-if="suggestions.length > 0"
        class="suggestions"
        :inert="dropdownOpen || null"
      >
        <SuggestionChip
          v-for="s in suggestions"
          :key="s.id"
          :label="s.name"
          @select="handleAdd(s)"
        />
      </div>

      <!-- Shared-with list -->
      <div
        v-if="recipients.length > 0"
        ref="resultsRef"
        class="share-dialog__results"
        :inert="dropdownOpen || null"
        @scroll="onResultsScroll"
      >
        <div class="share-dialog__section-header">
          <span class="share-dialog__section-label">Shared with:</span>
        </div>
        <ul class="share-dialog__list" role="list">
          <li v-for="recipient in recipients" :key="recipient.id">
            <ShareItem
              type="Tertiary"
              :name="recipient.name"
              :sub-text="recipient.subText"
              :tag="recipient.tag"
              :avatar-type="recipient.avatarType"
              :avatar-src="recipient.avatarSrc"
              :permission-control="false"
              :deletable="true"
              @remove="removeRecipient(recipient.id)"
            />
          </li>
        </ul>
      </div>

      <!-- Empty state -->
      <div v-else class="share-dialog__list-area">
        <div class="share-dialog__empty">
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
      </div>

    </div>

    <!-- ── Footer ── -->
    <div class="share-dialog__footer" :class="{ 'share-dialog__footer--bordered': isScrolled }">
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
        Share
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import IconClose from './icons/IconClose.vue'
import IconUser  from './icons/IconUser.vue'
import ShareItem      from './ShareItem.vue'
import SuggestionChip from './SuggestionChip.vue'
import { searchMockData, getSuggestions } from '../data/mockSearchData.js'

const props = defineProps({
  itemName: {
    type: String,
    default: '[name of task, doc, e-file]',
  },
})

const emit = defineEmits(['close', 'cancel', 'done', 'add'])

const searchQuery = ref('')
const isScrolled  = ref(false)
const resultsRef  = ref(null)
const recipients  = ref([])

// ── Modal focus behaviour (a11y #1, #2, #3) ──
const dialogRef = ref(null)

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Focusable elements inside the dialog, skipping anything inert or hidden. */
function focusableEls() {
  if (!dialogRef.value) return []
  return [...dialogRef.value.querySelectorAll(FOCUSABLE)].filter(
    el => !el.closest('[inert]') && el.offsetParent !== null
  )
}

function onDialogKeydown(e) {
  // Escape closes the dropdown first, then the dialog
  if (e.key === 'Escape') {
    if (dropdownOpen.value) dropdownOpen.value = false
    else emit('close')
    return
  }

  // Keep Tab inside the dialog
  if (e.key !== 'Tab') return
  const els = focusableEls()
  if (els.length === 0) return

  const first = els[0]
  const last  = els[els.length - 1]

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

// Move focus into the dialog on open, so its name and description are announced
onMounted(() => {
  nextTick(() => dialogRef.value?.focus())
})

// ── Results dropdown ──
const dropdownOpen  = ref(false)
const searchWrapRef = ref(null)

// Typing opens the dropdown; clearing the query closes it
watch(searchQuery, q => { dropdownOpen.value = q.length > 0 })

function onDocumentClick(e) {
  if (searchWrapRef.value && !searchWrapRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(()       => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

// ── Status announcements (a11y #6, #8) ──
// Announced through the permanently-rendered .sr-only region above, so screen
// readers pick up the change. Result counts come from the watcher below;
// add/remove confirmations are set directly by their handlers.
const statusMessage = ref('')

// Suggested recipients, minus anyone already added
const suggestions = computed(() =>
  getSuggestions().filter(s => !recipients.value.some(r => r.id === s.id))
)

// Show all matches; mark the ones already added so they render with the
// permission control instead of the Add button
const searchResults = computed(() => {
  return searchMockData(searchQuery.value).map(r => {
    const existing = recipients.value.find(x => x.id === r.id)
    return {
      ...r,
      added:      !!existing,
      permission: existing ? existing.permission : 'Read/display',
    }
  })
})

// Announce how many results the current query found (a11y #6)
watch([searchResults, dropdownOpen], () => {
  if (!dropdownOpen.value) return
  const n = searchResults.value.length
  statusMessage.value = n === 0
    ? `No results for ${searchQuery.value}`
    : `${n} result${n === 1 ? '' : 's'} available`
})

function checkOverflow(el) {
  if (!el) return
  isScrolled.value = Math.round(el.scrollTop + el.clientHeight) < el.scrollHeight
}

function onResultsScroll(e) {
  checkOverflow(e.target)
}

watch([searchResults, recipients], () => {
  isScrolled.value = false
  nextTick(() => checkOverflow(resultsRef.value))
})

function handleAdd(result) {
  recipients.value.push({
    ...result,
    permission: 'Read/display',
  })
  searchQuery.value = ''
  // Set after clearing the query, so the results watcher can't overwrite it
  nextTick(() => { statusMessage.value = `${result.name} added` })
  emit('add', result)
}

function removeRecipient(id) {
  const gone = recipients.value.find(r => r.id === id)
  recipients.value = recipients.value.filter(r => r.id !== id)
  if (gone) nextTick(() => { statusMessage.value = `${gone.name} removed` })
}

// Stable IDs for accessibility
const uid     = Math.random().toString(36).slice(2, 8)
const titleId = computed(() => `share-dialog-title-${uid}`)
const descId  = computed(() => `share-dialog-desc-${uid}`)
const inputId = computed(() => `share-dialog-search-${uid}`)
</script>

<style scoped>
/* ── Shell ── */
.share-dialog {
  display: flex;
  flex-direction: column;
  width: 488px;
  height: 602px;
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
  flex: 1 0 0;
  min-height: 0;
  padding-top: 24px;
  overflow: hidden;
}

/* ── Search field ── */
.share-dialog__search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  /* No bottom padding — what follows (chips / results) owns its own top
     spacing, so the gap below the input matches the design exactly */
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

.share-dialog__input--active {
  border-color: var(--color-neutral-400);
}

.share-dialog__input:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(5, 36, 116, 0.12);
}

/* ── Suggestion chips ── */
.suggestions {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 20px 0;
  flex-shrink: 0;
}

/* ── Results dropdown (anchored to the search input) ── */
.search-anchor {
  position: relative;
}

.results-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
  padding: 4px;
  background: var(--color-neutral-0);
  border: 1px solid #dddddd;
  border-radius: var(--radius-lg);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06);
  scrollbar-width: thin;
  scrollbar-color: #dddddd transparent;
}

.results-dropdown::-webkit-scrollbar        { width: 4px; }
.results-dropdown::-webkit-scrollbar-track  { background: transparent; }
.results-dropdown::-webkit-scrollbar-thumb  { background: #dddddd; border-radius: 999px; }

.results-dropdown__option {
  display: block;
  width: 100%;
  padding: 0;
  background: transparent;
  border-radius: var(--radius-lg);
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-default);
}

.results-dropdown__option:hover,
.results-dropdown__option:focus-visible {
  background: #f5f5f5;
}

/* Already added — shown for context, but not selectable */
.results-dropdown__option--disabled,
.results-dropdown__option--disabled:hover {
  background: transparent;
  cursor: default;
}

.results-dropdown__empty {
  padding: 16px 10px;
  font-size: var(--text-sm);
  color: var(--color-neutral-400);
  text-align: center;
}

/* ── Scrollable results / shared-with container ── */
.share-dialog__results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 0 0;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 10px 20px;
  scrollbar-width: thin;
  scrollbar-color: #939393 #f5f5f5;
}

.share-dialog__results::-webkit-scrollbar {
  width: 4px;
}

.share-dialog__results::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 2px;
}

.share-dialog__results::-webkit-scrollbar-thumb {
  background: #939393;
  border-radius: 2px;
}

/* ── Section header (shared by results + shared-with) ── */
.share-dialog__section-header {
  padding: 0 10px;
  height: 18px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.share-dialog__section-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-700);
  white-space: nowrap;
}

.share-dialog__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.share-dialog__no-results {
  padding: 16px 10px;
  font-size: var(--text-sm);
  color: var(--color-neutral-400);
  text-align: center;
}

/* ── Empty state ── */
.share-dialog__list-area {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 100%;
}

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
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  line-height: 20px;
  color: var(--color-neutral-700);
}

.share-dialog__empty-body {
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: 20px;
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
  background: var(--color-neutral-0);
  border-top: 1px solid transparent;
  transition: border-color 120ms ease;
}

.share-dialog__footer--bordered {
  border-top-color: #f5f5f5;
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
