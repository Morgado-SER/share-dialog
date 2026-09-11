<template>
  <div ref="panelRef" class="permissions-panel">
    <h3 :id="titleId" class="permissions-panel__title">
      <template v-if="titleText">Permissions for <strong>"{{ titleText }}"</strong></template>
      <template v-else>Permissions</template>
    </h3>

    <div class="permissions-panel__table" role="table" :aria-labelledby="titleId">
      <!-- Header (a11y #23, #24) -->
      <div class="perm-table__row perm-table__row--header" role="row">
        <button
          v-for="col in columns"
          :key="col.key"
          :id="`${uid}-col-${col.key}`"
          type="button"
          class="perm-table__cell perm-table__sort-btn"
          :class="col.key === 'name' ? 'perm-table__cell--name' : 'perm-table__cell--action'"
          role="columnheader"
          :aria-sort="sortCol === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
          @click="toggleSort(col.key)"
        >
          <span>{{ col.label }}</span>
          <IconSort class="perm-table__sort" :direction="sortCol === col.key ? sortDir : null" />
        </button>
      </div>

      <!-- Body -->
      <div v-if="permissions.length > 0" class="perm-table__body" role="rowgroup">
        <div
          v-for="perm in sortedPermissions"
          :key="perm.id"
          class="perm-table__row"
          :data-perm-id="perm.id"
          role="row"
        >
          <div class="perm-table__cell perm-table__cell--name" role="cell">
            <span
              class="perm-table__label"
              :tabindex="labelTabIndex(perm.id)"
              @mouseenter="onLabelHover($event, perm.name)"
              @mouseleave="tip.hide()"
              @focus="onLabelHover($event, perm.name)"
              @blur="tip.hideNow()"
            >{{ perm.name }}</span>
          </div>

          <!-- One cell per permission column. Each control is a real checkbox
               with a name and a three-way state (a11y #19, #20) -->
          <div
            v-for="col in actionColumns"
            :key="col.key"
            class="perm-table__cell perm-table__cell--action"
            role="cell"
          >
            <button
              type="button"
              class="perm-checkbox"
              :class="{
                'perm-checkbox--checked': perm[col.key] === 'all',
                'perm-checkbox--partial': perm[col.key] === 'some',
              }"
              role="checkbox"
              :aria-checked="ariaChecked(perm[col.key])"
              :aria-label="`${col.label} — ${perm.name}`"
              @click="emit('toggle', perm.id, col.key)"
            >
              <svg v-if="perm[col.key] !== 'none'" width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state — no recipients selected -->
      <div v-else class="perm-table__empty">
        <div class="perm-table__empty-icon" aria-hidden="true">
          <IconUser />
        </div>
        <div class="perm-table__empty-text">
          <p class="perm-table__empty-title">No recipients selected</p>
          <p class="perm-table__empty-body">Please select a recipient to manage permissions</p>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="tip.visible.value"
      class="share-tooltip"
      :style="tip.style.value"
      @mouseenter="tip.cancelHide()"
      @mouseleave="tip.hide()"
    >{{ tip.text.value }}</div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useTooltip } from '../composables/useTooltip.js'
import IconSort from './icons/IconSort.vue'
import IconUser from './icons/IconUser.vue'

const props = defineProps({
  selectedNames: { type: Array, default: () => [] },
  permissions:   { type: Array, required: true },
})

const emit = defineEmits(['toggle'])

const panelRef = ref(null)

// Column definitions drive both the header and the body cells, so their labels
// and sort keys can't drift apart
const columns = [
  { key: 'name',     label: 'Name' },
  { key: 'allow',    label: 'Allow' },
  { key: 'deny',     label: 'Deny' },
  { key: 'delegate', label: 'Delegate' },
]
const actionColumns = columns.filter(c => c.key !== 'name')

/** Map the three-way state onto ARIA — 'mixed' is exactly the partial state */
const ariaChecked = state =>
  state === 'all' ? 'true' : state === 'some' ? 'mixed' : 'false'

const uid     = Math.random().toString(36).slice(2, 8)
const titleId = `perm-panel-title-${uid}`

const titleText = computed(() => {
  const n = props.selectedNames.length
  if (n === 0) return null
  if (n === 1) return props.selectedNames[0]
  return `${n} recipients`
})

// Truncated permission names reveal on hover *and* on focus (a11y #17)
const tip = useTooltip()

function onLabelHover(event, text) {
  const el = event.currentTarget
  if (el.scrollWidth <= el.clientWidth) return
  tip.show(el, text)
}

/**
 * A permission name is only worth focusing when it is actually cut off.
 * Measured against the rendered cell, and refreshed when the panel resizes.
 */
const truncatedIds  = ref([])
// dataset values are strings, permission ids are numbers — compare as strings
const labelTabIndex = id => (truncatedIds.value.includes(String(id)) ? 0 : undefined)

function refreshTruncated() {
  if (!panelRef.value) return
  truncatedIds.value = [...panelRef.value.querySelectorAll('.perm-table__row')]
    .flatMap(row => {
      const el = row.querySelector('.perm-table__label')
      return el && el.scrollWidth > el.clientWidth ? [row.dataset.permId] : []
    })
}

let resizeObserver = null

onMounted(() => {
  nextTick(refreshTruncated)
  if (typeof ResizeObserver !== 'undefined' && panelRef.value) {
    resizeObserver = new ResizeObserver(refreshTruncated)
    resizeObserver.observe(panelRef.value)
  }
})
onBeforeUnmount(() => resizeObserver?.disconnect())
watch(() => props.permissions, () => nextTick(refreshTruncated), { deep: true })

const sortCol = ref(null)   // 'name' | 'allow' | 'deny' | 'delegate' | null
const sortDir = ref('asc')  // 'asc' | 'desc'

function toggleSort(col) {
  if (sortCol.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortCol.value = col
    sortDir.value = 'asc'
  }
}

// Permission columns hold a three-way state; rank them so asc = most-granted first
const STATE_RANK = { all: 0, some: 1, none: 2 }

const sortedPermissions = computed(() => {
  if (!sortCol.value) return props.permissions
  return [...props.permissions].sort((a, b) => {
    let av = a[sortCol.value]
    let bv = b[sortCol.value]
    if (sortCol.value === 'name') {
      av = av.toLowerCase()
      bv = bv.toLowerCase()
    } else {
      av = STATE_RANK[av] ?? 3
      bv = STATE_RANK[bv] ?? 3
    }
    if (av < bv) return sortDir.value === 'asc' ? -1 : 1
    if (av > bv) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
})
</script>

<style scoped>
.permissions-panel {
  width: 608px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px 20px 20px 16px;
  overflow: hidden;
}

.permissions-panel__title {
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  color: #212121;
  flex-shrink: 0;
}

.permissions-panel__title strong {
  font-weight: 600;
}

/* ── Table shell ── */
.permissions-panel__table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #dddddd; /* structural gridline, not a control boundary */
  border-radius: 8px;
  overflow: hidden;
}

/* ── Row ── */
.perm-table__row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #f0f0f0;
}

.perm-table__row:last-child {
  border-bottom: none;
}

.perm-table__row--header {
  border-bottom-color: #dddddd;
  flex-shrink: 0;
}

/* ── Body (scrollable) ── */
.perm-table__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #939393 #f5f5f5;
}

.perm-table__body::-webkit-scrollbar        { width: 4px; }
.perm-table__body::-webkit-scrollbar-track  { background: #f5f5f5; border-radius: 2px; }
.perm-table__body::-webkit-scrollbar-thumb  { background: #939393; border-radius: 2px; }

/* ── Empty state ── */
.perm-table__empty {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
}

.perm-table__empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8f8f8;
  border-radius: 999px;
  color: #939393;
}

.perm-table__empty-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.perm-table__empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
}

.perm-table__empty-body {
  font-size: 14px;
  font-weight: 400;
  color: #555555;
}

/* ── Cells ── */
.perm-table__cell {
  display: flex;
  align-items: center;
  height: 40px;
  background: #ffffff;
}

.perm-table__cell--name {
  flex: 1;
  min-width: 0;
  gap: 6px;
  padding: 0 16px;
  font-size: 14px;
  color: #555555;
}

.perm-table__cell--action {
  width: 90px;
  flex-shrink: 0;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
}

/* Header cells */
.perm-table__row--header .perm-table__cell {
  font-weight: 600;
  color: #555555;
}

.perm-table__sort-btn {
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 100ms ease;
}

.perm-table__sort-btn:hover {
  background: #f5f5f5;
}

/* Data cells */
.perm-table__body .perm-table__cell {
  font-weight: 400;
}

.perm-table__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.perm-table__sort {
  flex-shrink: 0;
  color: #939393;
}

/* ── Checkbox ── */
.perm-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: #ffffff;
  flex-shrink: 0;
  transition: background 100ms ease, border-color 100ms ease;
}

.perm-checkbox--checked {
  background: #052474;
  border-color: #052474;
}

/* Partial — checked for some, but not all, selected recipients */
.perm-checkbox--partial {
  background: #d9d9d9;
  border-color: #d9d9d9;
}
</style>
