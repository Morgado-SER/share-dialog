<template>
  <div class="a11y">

    <!-- ── Header + progress ── -->
    <header class="a11y__header">
      <div class="a11y__heading">
        <h2 class="a11y__title">Accessibility QA — {{ auditMeta.scope }}</h2>
        <p class="a11y__meta">
          {{ auditMeta.standard }} · {{ auditMeta.date }} ·
          <a :href="auditMeta.reference" target="_blank" rel="noopener noreferrer">WCAG 2.2 Quick Reference</a>
        </p>
      </div>

      <div class="a11y__progress">
        <div class="a11y__progress-head">
          <span class="a11y__progress-count">{{ doneCount }} / {{ findings.length }} done</span>
          <button
            v-if="doneCount > 0"
            type="button"
            class="a11y__reset"
            @click="resetAll"
          >Reset</button>
        </div>
        <div
          class="a11y__bar"
          role="progressbar"
          :aria-valuenow="doneCount"
          aria-valuemin="0"
          :aria-valuemax="findings.length"
          :aria-label="`${doneCount} of ${findings.length} findings resolved`"
        >
          <div class="a11y__bar-fill" :style="{ width: progressPct + '%' }" />
        </div>
      </div>
    </header>

    <!-- ── Severity summary ── -->
    <div class="a11y__summary">
      <span class="a11y__filter-label">Severity</span>
      <button
        v-for="s in severityOrder"
        :key="s"
        type="button"
        class="a11y__stat"
        :class="[`a11y__stat--${s}`, { 'a11y__stat--muted': filter !== 'all' && filter !== s }]"
        :aria-pressed="filter === s"
        @click="filter = filter === s ? 'all' : s"
      >
        <span class="a11y__stat-dot" />
        <span class="a11y__stat-num">{{ remainingBySeverity[s] }}</span>
        <span class="a11y__stat-label">{{ severityLabel[s] }} left</span>
      </button>

      <button
        type="button"
        class="a11y__stat a11y__stat--all"
        :class="{ 'a11y__stat--muted': filter !== 'all' }"
        :aria-pressed="filter === 'all'"
        @click="filter = 'all'"
      >All</button>

      <label class="a11y__toggle">
        <input v-model="hideDone" type="checkbox" />
        Hide completed
      </label>
    </div>

    <!-- ── Category summary ── -->
    <div class="a11y__summary">
      <span class="a11y__filter-label">Who owns it</span>
      <button
        v-for="c in categoryOrder"
        :key="c"
        type="button"
        class="a11y__stat"
        :class="[`a11y__stat--cat-${c}`, { 'a11y__stat--muted': catFilter !== 'all' && catFilter !== c }]"
        :aria-pressed="catFilter === c"
        @click="catFilter = catFilter === c ? 'all' : c"
      >
        <span class="a11y__stat-dot" />
        <span class="a11y__stat-num">{{ remainingByCategory[c] }}</span>
        <span class="a11y__stat-label">{{ categoryLabel[c] }} left</span>
      </button>

      <button
        type="button"
        class="a11y__stat a11y__stat--all"
        :class="{ 'a11y__stat--muted': catFilter !== 'all' }"
        :aria-pressed="catFilter === 'all'"
        @click="catFilter = 'all'"
      >All</button>
    </div>

    <p class="a11y__layout-note">
      <strong>Layout impact:</strong> none of these change layout or geometry. Every design
      item is a colour/token change or overlay behaviour — nothing reflows or resizes. The one
      possible layout risk (fixed heights vs. SC&nbsp;1.4.12 Text Spacing) is unverified and
      listed under “Not verified” below.
    </p>

    <!-- ── Findings checklist ── -->
    <section
      v-for="s in severityOrder"
      v-show="(filter === 'all' || filter === s) && groupedVisible[s].length > 0"
      :key="s"
      class="a11y__group"
    >
      <h3 class="a11y__group-title">
        <span class="a11y__stat-dot" :class="`a11y__stat-dot--${s}`" />
        {{ severityLabel[s] }} priority
        <span class="a11y__group-count">{{ groupedVisible[s].length }}</span>
      </h3>

      <ul class="a11y__list">
        <li
          v-for="f in groupedVisible[s]"
          :key="f.id"
          class="a11y__item"
          :class="{ 'a11y__item--done': isDone(f.id) }"
        >
          <label class="a11y__check">
            <input
              type="checkbox"
              :checked="isDone(f.id)"
              @change="toggle(f.id)"
            />
            <span class="a11y__check-box" aria-hidden="true">
              <svg v-if="isDone(f.id)" width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </label>

          <div class="a11y__body">
            <p class="a11y__item-title">{{ f.title }}</p>

            <div class="a11y__badges">
              <span class="a11y__cat" :class="`a11y__cat--${f.category}`">
                {{ categoryLabel[f.category] }}
              </span>
              <span class="a11y__sc">{{ f.sc }}</span>
              <span
                class="a11y__source"
                :class="f.measured ? 'a11y__source--measured' : 'a11y__source--inferred'"
              >{{ f.measured ? 'Measured' : 'Needs verifying' }}</span>
            </div>

            <p class="a11y__evidence">{{ f.evidence }}</p>
            <p class="a11y__action"><strong>Action:</strong> {{ f.action }}</p>
          </div>
        </li>
      </ul>
    </section>

    <p v-if="visibleTotal === 0" class="a11y__empty">
      Nothing to show — everything here is checked off. 🎉
    </p>

    <!-- ── Passing + caveats ── -->
    <section class="a11y__group">
      <h3 class="a11y__group-title a11y__group-title--pass">Already passing</h3>
      <ul class="a11y__passing">
        <li v-for="p in passing" :key="p.sc">
          <strong>{{ p.sc }}</strong> — {{ p.note }}
        </li>
      </ul>
    </section>

    <section class="a11y__group">
      <h3 class="a11y__group-title a11y__group-title--caveat">Not verified — still needs a human</h3>
      <ul class="a11y__passing">
        <li v-for="(c, i) in caveats" :key="i">{{ c }}</li>
      </ul>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { findings, passing, caveats, auditMeta } from '../data/accessibilityFindings.js'

const STORAGE_KEY = 'share-dialog:a11y-done'

const severityOrder = ['high', 'medium', 'low']
const severityLabel = { high: 'High', medium: 'Medium', low: 'Low' }

const categoryOrder = ['design', 'both', 'engineering']
const categoryLabel = {
  design:      'Design',
  both:        'Design + Eng',
  engineering: 'Engineering',
}

const filter    = ref('all')
const catFilter = ref('all')
const hideDone  = ref(false)

// Completed ids, persisted so ticks survive a reload
const done = ref(load())

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

watch(done, val => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(val)) } catch { /* ignore */ }
}, { deep: true })

const isDone = id => done.value.includes(id)

function toggle(id) {
  done.value = isDone(id)
    ? done.value.filter(x => x !== id)
    : [...done.value, id]
}

function resetAll() {
  done.value = []
}

const doneCount   = computed(() => findings.filter(f => isDone(f.id)).length)
const progressPct = computed(() => Math.round((doneCount.value / findings.length) * 100))

const remainingBySeverity = computed(() =>
  severityOrder.reduce((acc, s) => {
    acc[s] = findings.filter(f => f.severity === s && !isDone(f.id)).length
    return acc
  }, {})
)

const remainingByCategory = computed(() =>
  categoryOrder.reduce((acc, c) => {
    acc[c] = findings.filter(f => f.category === c && !isDone(f.id)).length
    return acc
  }, {})
)

// Severity grouping for display; the category filter narrows within each group
const groupedVisible = computed(() =>
  severityOrder.reduce((acc, s) => {
    acc[s] = findings.filter(f =>
      f.severity === s &&
      (catFilter.value === 'all' || f.category === catFilter.value) &&
      (!hideDone.value || !isDone(f.id))
    )
    return acc
  }, {})
)

const visibleTotal = computed(() =>
  severityOrder
    .filter(s => filter.value === 'all' || filter.value === s)
    .reduce((n, s) => n + groupedVisible.value[s].length, 0)
)
</script>

<style scoped>
.a11y {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 860px;
}

/* ── Header ── */
.a11y__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.a11y__title {
  font-size: 20px;
  font-weight: var(--weight-medium);
  line-height: 1.2;
  color: var(--color-brand-600);
}

.a11y__meta {
  margin-top: 4px;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.a11y__meta a { color: var(--color-brand-600); }

.a11y__progress {
  min-width: 200px;
}

.a11y__progress-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: 6px;
}

.a11y__progress-count {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-700);
}

.a11y__reset {
  background: transparent;
  font-size: var(--text-xs);
  color: var(--color-brand-600);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.a11y__bar {
  height: 6px;
  border-radius: 999px;
  background: #e5e5e5;
  overflow: hidden;
}

.a11y__bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--color-brand-600);
  transition: width 200ms ease;
}

/* ── Severity summary ── */
.a11y__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.a11y__stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #dddddd;
  border-radius: var(--radius-md);
  background: var(--color-neutral-0);
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: background var(--transition-default), opacity var(--transition-default);
}

.a11y__stat:hover { background: #f5f5f5; }
.a11y__stat--muted { opacity: 0.5; }
.a11y__stat-num { font-weight: var(--weight-semibold); }
.a11y__stat-label { color: var(--color-neutral-500); }

.a11y__stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
  background: currentColor;
}

.a11y__stat--high   .a11y__stat-dot,
.a11y__stat-dot--high   { background: #d3200e; }
.a11y__stat--medium .a11y__stat-dot,
.a11y__stat-dot--medium { background: #b26a00; }
.a11y__stat--low    .a11y__stat-dot,
.a11y__stat-dot--low    { background: #7a7a7a; }

.a11y__stat--all .a11y__stat-dot { display: none; }

/* Category dots */
.a11y__stat--cat-design      .a11y__stat-dot { background: #7b3fa0; }
.a11y__stat--cat-both        .a11y__stat-dot { background: #0a6b8a; }
.a11y__stat--cat-engineering .a11y__stat-dot { background: #4a5568; }

.a11y__filter-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-neutral-400);
  margin-right: 2px;
  min-width: 78px;
}

.a11y__layout-note {
  padding: 10px 12px;
  border-left: 3px solid var(--color-brand-600);
  background: #f3f4f8;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-neutral-500);
}

.a11y__layout-note strong { color: var(--color-neutral-700); }

.a11y__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  cursor: pointer;
}

/* ── Groups ── */
.a11y__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.a11y__group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-neutral-500);
}

.a11y__group-count {
  padding: 1px 6px;
  border-radius: 999px;
  background: #f0f0f0;
  letter-spacing: 0;
  color: var(--color-neutral-700);
}

.a11y__group-title--pass    { color: #1a7a3c; }
.a11y__group-title--caveat  { color: #b26a00; }

/* ── Items ── */
.a11y__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.a11y__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #eeeeee;
  border-radius: var(--radius-lg);
  background: var(--color-neutral-0);
  transition: opacity var(--transition-default), background var(--transition-default);
}

.a11y__item--done {
  opacity: 0.55;
  background: #fafafa;
}

.a11y__item--done .a11y__item-title {
  text-decoration: line-through;
}

/* Checkbox */
.a11y__check {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  cursor: pointer;
}

.a11y__check input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.a11y__check-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid #949494;
  border-radius: 4px;
  background: var(--color-neutral-0);
  transition: background 100ms ease, border-color 100ms ease;
}

.a11y__item--done .a11y__check-box {
  background: var(--color-brand-600);
  border-color: var(--color-brand-600);
}

.a11y__check input:focus-visible + .a11y__check-box {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Body */
.a11y__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.a11y__item-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-700);
}

.a11y__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.a11y__cat,
.a11y__sc,
.a11y__source {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  white-space: nowrap;
}

.a11y__cat { font-weight: var(--weight-semibold); }
.a11y__cat--design      { background: #f3e8fa; color: #6a3590; }
.a11y__cat--both        { background: #e0f2f7; color: #075c78; }
.a11y__cat--engineering { background: #eceef2; color: #3d4756; }

.a11y__sc {
  background: #e6e9f1;
  color: var(--color-brand-600);
}

.a11y__source--measured { background: #e7f4ec; color: #1a7a3c; }
.a11y__source--inferred { background: #fdf1e0; color: #8a5200; }

.a11y__evidence,
.a11y__action {
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-neutral-500);
}

.a11y__action strong { color: var(--color-neutral-700); }

/* ── Passing / caveats ── */
.a11y__passing {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-neutral-500);
}

.a11y__passing strong { color: var(--color-neutral-700); }

.a11y__empty {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}
</style>
