<template>
  <div
    class="share-dialog"
    :class="{ 'share-dialog--expanded': isExpanded }"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >

    <!-- ── Header ── -->
    <div class="share-dialog__header">
      <div class="share-dialog__header-inner">
        <h2 :id="titleId" class="share-dialog__title">
          Rights for <span class="share-dialog__item-name">{{ itemName }}</span>
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
        Grant rights for individuals, groups, teams, or roles.
      </p>
    </div>

    <!-- ── Main (row layout: left body + optional right panel) ── -->
    <div class="share-dialog__main">

      <!-- Left: search + results -->
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
              @keydown.esc="dropdownOpen = false"
            />

            <!-- Results dropdown — click a row to add; already-added people
                 are shown for context with an "Already added" label -->
            <div
              v-if="dropdownOpen"
              class="results-dropdown"
              role="listbox"
              aria-live="polite"
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

        <!-- Suggested recipients — one click adds them, same as a dropdown row -->
        <div v-if="suggestions.length > 0" class="suggestions">
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
          aria-live="polite"
          aria-atomic="true"
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
                :permission="recipient.permission"
                :advanced="advancedMode"
                :selected="advancedMode && selectedIds.includes(recipient.id)"
                @select="handleSelect(recipient.id)"
                @update:permission="updatePermission(recipient.id, $event)"
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

      <!-- Right: permissions panel -->
      <Transition name="panel">
        <PermissionsPanel
          v-if="isExpanded"
          :selected-names="selectedNames"
          :permissions="combinedPermissions"
          @toggle="togglePermission"
        />
      </Transition>

    </div>

    <!-- ── Footer ── -->
    <div class="share-dialog__footer" :class="{ 'share-dialog__footer--bordered': isScrolled }">
      <button
        type="button"
        class="share-dialog__link"
        :class="{ 'share-dialog__link--disabled': advancedDisabled }"
        :aria-disabled="advancedDisabled"
        @click="handleAdvancedOptions"
        @mouseenter="onAdvHover"
        @mouseleave="advTooltipVisible = false"
      >
        {{ advancedMode ? 'Hide advanced options' : 'Show advanced options' }}
      </button>

      <div class="share-dialog__footer-actions">
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

    <!-- Tooltip for the disabled "Advanced options" link -->
    <Teleport to="body">
      <div
        v-if="advTooltipVisible"
        class="adv-tooltip"
        :style="advTooltipStyle"
      >
        Please add recipients to get access to advanced options
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import IconClose        from './icons/IconClose.vue'
import IconUser         from './icons/IconUser.vue'
import ShareItem        from './ShareItem.vue'
import SuggestionChip   from './SuggestionChip.vue'
import PermissionsPanel from './PermissionsPanel.vue'
import { searchMockData, getSuggestions } from '../data/mockSearchData.js'
import { getPermissionTemplate } from '../data/mockPermissions.js'

const props = defineProps({
  itemName: {
    type: String,
    default: '[name of task, doc, e-file]',
  },
})

const emit = defineEmits(['close', 'cancel', 'done', 'add', 'advanced-options'])

const searchQuery    = ref('')
const isScrolled     = ref(false)
const resultsRef     = ref(null)
const recipients     = ref([])
const selectedIds    = ref([])
const advancedMode   = ref(false)

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

// The dialog expands (and reveals the permissions panel) only in advanced mode
const isExpanded = computed(() => advancedMode.value)

const selectedRecipients = computed(() =>
  recipients.value.filter(r => selectedIds.value.includes(r.id))
)
const selectedNames = computed(() => selectedRecipients.value.map(r => r.name))

// Combined permissions across all selected recipients. Each cell resolves to a
// three-way state so the combination is visible:
//   'all'  → every selected recipient has it   (blue checkbox)
//   'some' → only some recipients have it       (grey checkbox)
//   'none' → no selected recipient has it       (empty checkbox)
// Toggling a cell (togglePermission) then applies to all selected recipients.
const combinedPermissions = computed(() => {
  const sel = selectedRecipients.value
  if (sel.length === 0) return []
  return sel[0].customPerms.map(row => {
    const merged = { id: row.id, name: row.name }
    for (const col of ['allow', 'deny', 'delegate']) {
      const on = sel.filter(r => {
        const p = r.customPerms.find(x => x.id === row.id)
        return !!(p && p[col])
      }).length
      merged[col] = on === 0 ? 'none' : on === sel.length ? 'all' : 'some'
    }
    return merged
  })
})

// Advanced options is unavailable until there is at least one recipient
const advancedDisabled = computed(() => recipients.value.length === 0)

// Tooltip shown when hovering the disabled "Advanced options" link
const advTooltipVisible = ref(false)
const advTooltipStyle   = ref({})

function onAdvHover(e) {
  if (!advancedDisabled.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  advTooltipStyle.value = {
    left: `${rect.left}px`,
    top:  `${rect.top - 8}px`,
  }
  advTooltipVisible.value = true
}

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
    permission:  'Read/display',
    customPerms: getPermissionTemplate('Read/display'),
  })
  searchQuery.value = ''
  emit('add', result)
}

// Enter advanced mode: expand the dialog + show the permissions panel.
// Auto-select the first recipient so the panel always has content.
function handleAdvancedOptions() {
  if (advancedDisabled.value) return
  if (advancedMode.value) {
    // Already expanded → collapse back to the compact (initial) view
    advancedMode.value = false
    selectedIds.value = []
  } else {
    // First expand → focus the first recipient
    advancedMode.value = true
    selectedIds.value = [recipients.value[0].id]
  }
  emit('advanced-options')
}

// Toggle a recipient in/out of the selection (true multi-select checkbox)
function handleSelect(id) {
  const i = selectedIds.value.indexOf(id)
  if (i === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(i, 1)
}

function updatePermission(id, permission) {
  const r = recipients.value.find(r => r.id === id)
  if (!r) return
  r.permission = permission

  if (permission === 'Custom') {
    // Custom needs the table — switch to advanced mode and focus this recipient
    advancedMode.value = true
    selectedIds.value = [id]
  } else {
    r.customPerms = getPermissionTemplate(permission)
  }
}

// Toggle a permission cell for every currently-selected recipient at once.
// 'all' → turn off for everyone; 'some'/'none' → turn on for everyone.
function togglePermission(permId, column) {
  const current = combinedPermissions.value.find(p => p.id === permId)
  if (!current) return
  const newVal = current[column] !== 'all'
  for (const r of selectedRecipients.value) {
    const p = r.customPerms.find(x => x.id === permId)
    if (p) p[column] = newVal
  }
}

function removeRecipient(id) {
  recipients.value = recipients.value.filter(r => r.id !== id)
  selectedIds.value = selectedIds.value.filter(sid => sid !== id)
  // No recipients left → drop back to the compact (non-advanced) view
  if (recipients.value.length === 0) advancedMode.value = false
}

// Stable IDs for accessibility
const uid     = Math.random().toString(36).slice(2, 8)
const titleId = computed(() => `share-dialog-title-${uid}`)
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
  transition: width 240ms ease;
}

.share-dialog--expanded {
  width: 1048px;
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

/* ── Main row wrapper ── */
.share-dialog__main {
  display: flex;
  flex-direction: row;
  flex: 1 0 0;
  min-height: 0;
  overflow: hidden;
}

/* ── Body (left column) ── */
.share-dialog__body {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  min-width: 0;
  min-height: 0;
  padding-top: 24px;
  overflow: hidden;
}

/* When expanded, the left column is a fixed 440px beside the panel */
.share-dialog--expanded .share-dialog__body {
  flex: 0 0 440px;
  width: 440px;
}

/* ── Panel transition ── */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(12px);
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
  justify-content: space-between;
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

.share-dialog__footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Advanced options link button ── */
.share-dialog__link {
  background: transparent;
  padding: 0 2px;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: 1;
  color: var(--color-brand-600);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 2px;
  transition: text-decoration-color var(--transition-default);
  cursor: pointer;
}

.share-dialog__link:hover {
  text-decoration-color: currentColor;
}

.share-dialog__link--disabled {
  color: #c3c3c3;
  cursor: not-allowed;
}

.share-dialog__link--disabled:hover {
  text-decoration-color: transparent;
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

<!-- Unscoped: tooltip is teleported to <body> -->
<style>
.adv-tooltip {
  position: fixed;
  z-index: 300;
  transform: translateY(-100%);
  max-width: 220px;
  background: #212121;
  color: #ffffff;
  font-size: 12px;
  line-height: 1.4;
  padding: 6px 8px;
  border-radius: 4px;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.20);
}
</style>
