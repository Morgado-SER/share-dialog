<template>
  <div class="prototype-shell">
    <header class="prototype-header">
      <span class="prototype-badge">Prototype</span>
      <span class="prototype-title">Share Dialog</span>
    </header>

    <!-- Nav tabs -->
    <nav class="prototype-nav">
      <button
        class="prototype-nav__tab"
        :class="{ 'prototype-nav__tab--active': view === 'share' }"
        @click="view = 'share'"
      >Share</button>
      <button
        class="prototype-nav__tab"
        :class="{ 'prototype-nav__tab--active': view === 'rights' }"
        @click="view = 'rights'"
      >Rights</button>
      <button
        class="prototype-nav__tab"
        :class="{ 'prototype-nav__tab--active': view === 'components' }"
        @click="view = 'components'"
      >Components</button>
    </nav>

    <!-- Share dialog (simple) -->
    <main v-if="view === 'share'" class="prototype-stage">
      <ShareDialog
        item-name="Project Alpha — Q3 Report"
        @close="handleClose"
        @cancel="handleCancel"
        @done="handleDone"
        @add="handleAdd"
      />
    </main>

    <!-- Rights dialog (advanced) -->
    <main v-else-if="view === 'rights'" class="prototype-stage">
      <RightsDialog
        item-name="Project Alpha — Q3 Report"
        @close="handleClose"
        @cancel="handleCancel"
        @done="handleDone"
        @add="handleAdd"
      />
    </main>

    <!-- Component gallery -->
    <main v-else class="prototype-gallery">

      <!-- Avatar variants -->
      <section class="gallery-section">
        <h3 class="gallery-section__title">Avatar — all variants</h3>
        <div class="gallery-row">
          <div class="gallery-item">
            <AvatarItem type="Avatar" src="https://i.pravatar.cc/84?img=12" name="João Morgado" />
            <span class="gallery-label">Avatar</span>
          </div>
          <div class="gallery-item">
            <AvatarItem type="User" />
            <span class="gallery-label">User</span>
          </div>
          <div class="gallery-item">
            <AvatarItem type="Group" />
            <span class="gallery-label">Group</span>
          </div>
          <div class="gallery-item">
            <AvatarItem type="Unit" />
            <span class="gallery-label">Unit</span>
          </div>
          <div class="gallery-item">
            <AvatarItem type="Role" />
            <span class="gallery-label">Role</span>
          </div>
        </div>
      </section>

      <!-- ShareItem — Tertiary variants -->
      <section class="gallery-section">
        <h3 class="gallery-section__title">ShareItem — Tertiary (search result / person)</h3>
        <div class="gallery-col">
          <div class="gallery-item gallery-item--row">
            <span class="gallery-label gallery-label--inline">Default</span>
            <ShareItem type="Tertiary" state="Default" name="João Morgado" sub-text="joao.morgado@doxis.com" />
          </div>
          <div class="gallery-item gallery-item--row">
            <span class="gallery-label gallery-label--inline">Hover</span>
            <ShareItem type="Tertiary" state="Hover" name="João Morgado" sub-text="joao.morgado@doxis.com" />
          </div>
          <div class="gallery-item gallery-item--row">
            <span class="gallery-label gallery-label--inline">Selected</span>
            <ShareItem type="Tertiary" state="Selected" name="João Morgado" sub-text="joao.morgado@doxis.com" />
          </div>
        </div>
      </section>

      <!-- ShareItem — Secondary variants -->
      <section class="gallery-section">
        <h3 class="gallery-section__title">ShareItem — Secondary (search result / role)</h3>
        <div class="gallery-col">
          <div class="gallery-item gallery-item--row">
            <span class="gallery-label gallery-label--inline">Default</span>
            <ShareItem type="Secondary" state="Default" name="João Morgado" sub-text="Administrator" tag="Role" />
          </div>
          <div class="gallery-item gallery-item--row">
            <span class="gallery-label gallery-label--inline">Hover</span>
            <ShareItem type="Secondary" state="Hover" name="João Morgado" sub-text="Administrator" tag="Role" />
          </div>
        </div>
      </section>

      <!-- Link button — Advanced options states -->
      <section class="gallery-section">
        <h3 class="gallery-section__title">Link button — Advanced options</h3>
        <div class="gallery-col">
          <div class="gallery-item gallery-item--row">
            <span class="gallery-label gallery-label--inline">Default</span>
            <button type="button" class="link-btn">Advanced options</button>
          </div>
          <div class="gallery-item gallery-item--row">
            <span class="gallery-label gallery-label--inline">Hover</span>
            <button type="button" class="link-btn link-btn--hover">Advanced options</button>
          </div>
          <div class="gallery-item gallery-item--row">
            <span class="gallery-label gallery-label--inline">Disabled</span>
            <button type="button" class="link-btn link-btn--disabled">Advanced options</button>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ShareDialog  from './components/ShareDialog.vue'
import RightsDialog from './components/RightsDialog.vue'
import AvatarItem   from './components/AvatarItem.vue'
import ShareItem    from './components/ShareItem.vue'

const view = ref('rights')

function handleClose()      { console.log('Dialog closed') }
function handleCancel()     { console.log('Cancelled') }
function handleDone()       { console.log('Done') }
function handleAdd(result)  { console.log('Added:', result.name) }
</script>

<style scoped>
.prototype-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
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

/* ── Nav tabs ── */
.prototype-nav {
  display: flex;
  gap: var(--space-1);
  padding: 0 var(--space-6);
  background: var(--color-neutral-800);
  border-bottom: 1px solid var(--color-neutral-700);
  flex-shrink: 0;
}

.prototype-nav__tab {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-400);
  padding: var(--space-2) var(--space-3);
  border-bottom: 2px solid transparent;
  transition: color var(--transition-default), border-color var(--transition-default);
}

.prototype-nav__tab:hover {
  color: var(--color-neutral-200);
}

.prototype-nav__tab--active {
  color: var(--color-neutral-0);
  border-bottom-color: var(--color-brand-400);
}

/* ── Dialog stage ── */
.prototype-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--color-bg-page);
}

/* ── Component gallery ── */
.prototype-gallery {
  flex: 1;
  padding: var(--space-8) var(--space-10);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

.gallery-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.gallery-section__title {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-neutral-400);
}

.gallery-row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.gallery-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 512px;
}

.gallery-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.gallery-item--row {
  flex-direction: row;
  align-items: center;
  gap: var(--space-4);
}

.gallery-label {
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
}

.gallery-label--inline {
  width: 56px;
  text-align: right;
  flex-shrink: 0;
}

/* ── Link button demo (Advanced options states) ── */
.link-btn {
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

.link-btn:hover,
.link-btn--hover {
  text-decoration-color: currentColor;
}

.link-btn--disabled,
.link-btn--disabled:hover {
  color: #c3c3c3;
  text-decoration-color: transparent;
  cursor: not-allowed;
}
</style>
