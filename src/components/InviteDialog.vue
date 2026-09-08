<template>
  <div
    class="share-dialog"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >

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

    <!-- ── Body: search + results ── -->
    <div class="share-dialog__body">

      <!-- Search bar: field (with inline permissions) + Invite button -->
      <div class="invite-searchbar">

        <div class="invite-searchbar__field">
          <label :for="inputId" class="share-dialog__label">
            Search people, groups, units, roles, or enter an email
          </label>

          <div ref="searchWrapRef" class="invite-search">
            <input
              :id="inputId"
              v-model="searchQuery"
              type="text"
              class="share-dialog__input"
              :class="{
                'share-dialog__input--active': searchQuery.length > 0,
                'invite-input--with-perm': showPermission,
              }"
              placeholder="Search by name or email"
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="showDropdown"
              @focus="openResults"
              @click="openResults"
              @keydown.esc="closeAllMenus"
            />

            <!-- Inline permissions control — only shown while searching for an
                 internal user (hidden once the query is an external email) -->
            <div v-if="showPermission" class="invite-perm">
              <button
                type="button"
                class="invite-perm__trigger"
                :aria-expanded="permMenuOpen"
                @click.stop="togglePermMenu"
              >
                <span>{{ permission }}</span>
                <IconChevronDown />
              </button>

              <div v-if="permMenuOpen" class="invite-perm__menu" role="listbox">
                <button
                  v-for="perm in INVITE_PERMISSIONS"
                  :key="perm"
                  type="button"
                  class="invite-perm__option"
                  :class="{ 'invite-perm__option--active': perm === permission }"
                  role="option"
                  :aria-selected="perm === permission"
                  @click.stop="selectPermission(perm)"
                >
                  <span>{{ perm }}</span>
                  <IconCheck v-if="perm === permission" class="invite-perm__check" />
                </button>
              </div>
            </div>

            <!-- Results dropdown — hidden once the search stops matching,
                 so the user is left typing just the email address -->
            <div
              v-if="showDropdown"
              class="invite-dropdown"
              role="listbox"
              aria-live="polite"
            >
              <button
                v-for="result in searchResults"
                :key="result.id"
                type="button"
                class="invite-dropdown__option"
                :class="{ 'invite-dropdown__option--disabled': result.added }"
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
            </div>
          </div>
        </div>

        <!-- Invite button — enabled once the typed email looks complete.
             No action wired up yet, per design review. -->
        <div class="invite-searchbar__action">
          <button
            type="button"
            class="invite-btn"
            :class="{ 'invite-btn--disabled': !canInvite }"
            :disabled="!canInvite"
          >
            Invite
          </button>
        </div>
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
        Done
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import IconClose        from './icons/IconClose.vue'
import IconUser         from './icons/IconUser.vue'
import IconCheck        from './icons/IconCheck.vue'
import IconChevronDown  from './icons/IconChevronDown.vue'
import ShareItem from './ShareItem.vue'
import { searchMockData } from '../data/mockSearchData.js'

const INVITE_PERMISSIONS = ['Read', 'Write', 'Full access']

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

// ── Results dropdown ──
const dropdownOpen  = ref(false)
const searchWrapRef = ref(null)

// Typing opens the results list (and never leaves the permissions menu open)
watch(searchQuery, q => {
  dropdownOpen.value = q.length > 0
  permMenuOpen.value = false
})

function onDocumentClick(e) {
  if (searchWrapRef.value && !searchWrapRef.value.contains(e.target)) {
    closeAllMenus()
  }
}

function closeAllMenus() {
  dropdownOpen.value = false
  permMenuOpen.value = false
}

onMounted(()       => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

// ── Inline permissions control ──
const permission   = ref(INVITE_PERMISSIONS[0])
const permMenuOpen = ref(false)

// Only one menu is ever open. Opening the permissions menu closes the results
// list; clicking/focusing the input closes the permissions menu and brings the
// results back. The typed query is left untouched either way.
function togglePermMenu() {
  permMenuOpen.value = !permMenuOpen.value
  if (permMenuOpen.value) dropdownOpen.value = false
}

function openResults() {
  dropdownOpen.value = true
  permMenuOpen.value = false
}

function selectPermission(perm) {
  permission.value = perm
  permMenuOpen.value = false
}

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

// ── Invite by email ──
// Once the search stops matching anything the user is typing an external
// address, so both the results list and the permissions control disappear.
const hasMatches = computed(() => searchResults.value.length > 0)

const showDropdown  = computed(() => dropdownOpen.value && hasMatches.value)
const showPermission = computed(() => searchQuery.value.trim().length > 0 && hasMatches.value)

// Enabled as soon as the address reaches the TLD — e.g. "johndoe@doxis.c"
const canInvite = computed(() =>
  /^[^\s@]+@[^\s@]+\.[A-Za-z]+$/.test(searchQuery.value.trim())
)

// Close the permissions menu whenever its trigger disappears
watch(showPermission, on => { if (!on) permMenuOpen.value = false })

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
    permission: permission.value,
  })
  searchQuery.value = ''
  permission.value = INVITE_PERMISSIONS[0]
  emit('add', result)
}

function removeRecipient(id) {
  recipients.value = recipients.value.filter(r => r.id !== id)
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

/* ── Search bar row: field + Invite button ── */
.invite-searchbar {
  display: flex;
  /* Bottom-align so the button lines up with the input, whatever the label height */
  align-items: flex-end;
  gap: 6px;
  padding: 0 20px 8px;
  flex-shrink: 0;
}

.invite-searchbar__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 0 0;
  min-width: 0;
}

.invite-searchbar__action {
  flex-shrink: 0;
}

/* ── Invite button ── */
.invite-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-width: 64px;
  padding: 0 12px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: 1;
  background: var(--color-brand-600);
  color: var(--color-neutral-0);
  cursor: pointer;
  transition: background var(--transition-default), color var(--transition-default);
}

.invite-btn:hover {
  background: var(--color-brand-700);
}

.invite-btn--disabled,
.invite-btn--disabled:hover {
  background: #f0f0f0;
  color: #c3c3c3;
  cursor: not-allowed;
}

/* ── Results dropdown (anchored to the search input) ── */
.invite-search {
  position: relative;
}

/* Room for the inline permissions control, only while it is shown */
.invite-input--with-perm {
  padding-right: 104px;
}

/* ── Inline permissions control (inside the input) ── */
.invite-perm {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  /* transform creates a stacking context, so the wrapper itself must sit
     above the results dropdown for its menu to be visible */
  z-index: 30;
}

.invite-perm__trigger {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 24px;
  padding: 0 4px 0 6px;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: 1;
  color: var(--color-brand-600);
  white-space: nowrap;
  cursor: pointer;
  transition: background var(--transition-default), color var(--transition-default);
}

.invite-perm__trigger:hover {
  background: #f0f0f0;
}

.invite-perm__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  background: var(--color-neutral-0);
  border: 1px solid #dddddd;
  border-radius: var(--radius-lg);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06);
}

.invite-perm__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: 1;
  color: var(--color-neutral-700);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition: background var(--transition-default);
}

.invite-perm__option:hover {
  background: #f5f5f5;
}

.invite-perm__option--active {
  background: #f3f4f8;
  color: var(--color-brand-600);
  font-weight: var(--weight-medium);
}

.invite-perm__check {
  flex-shrink: 0;
  color: var(--color-brand-600);
}

.invite-dropdown {
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
  /* Compact elevation — the dropdown sits inside the modal, so it only needs
     to lift off the dialog surface, not cast the modal's full page shadow */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06);
  scrollbar-width: thin;
  scrollbar-color: #dddddd transparent;
}

.invite-dropdown::-webkit-scrollbar        { width: 4px; }
.invite-dropdown::-webkit-scrollbar-track  { background: transparent; }
.invite-dropdown::-webkit-scrollbar-thumb  { background: #dddddd; border-radius: 999px; }

.invite-dropdown__option {
  display: block;
  width: 100%;
  padding: 0;
  background: transparent;
  border-radius: var(--radius-lg);
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-default);
}

.invite-dropdown__option:hover,
.invite-dropdown__option:focus-visible {
  background: #f5f5f5;
}

/* Already added — shown for context, but not selectable */
.invite-dropdown__option--disabled,
.invite-dropdown__option--disabled:hover {
  background: transparent;
  cursor: default;
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
