<template>
  <div class="prototype-shell">
    <header class="prototype-header">
      <span class="prototype-badge">Prototype</span>
      <span class="prototype-title">Share Dialog</span>
    </header>

    <main class="prototype-stage">
      <div class="placeholder-card">
        <div class="placeholder-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="var(--color-brand-100)"/>
            <path d="M26 14H14C12.9 14 12 14.9 12 16V28L16 24H26C27.1 24 28 23.1 28 22V16C28 14.9 27.1 14 26 14Z" fill="var(--color-brand-500)"/>
            <circle cx="27" cy="13" r="5" fill="var(--color-brand-600)"/>
            <path d="M25.5 11.5L27 13L29.5 10.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="placeholder-heading">Ready to prototype</h1>
        <p class="placeholder-body">
          Design tokens, reset styles, and the component scaffold are in place.<br>
          Tell me what to build first.
        </p>
        <ul class="placeholder-checklist">
          <li class="done">Repository structure</li>
          <li class="done">Documentation scaffolding</li>
          <li class="done">Design tokens</li>
          <li class="done">CSS reset</li>
          <li class="done">Vue 3 app shell</li>
          <li class="pending">First feature</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
// App shell — no logic needed yet
</script>

<style scoped>
.prototype-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Dev header — remove before handover */
.prototype-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--color-neutral-900);
  border-bottom: 1px solid var(--color-neutral-700);
}

.prototype-badge {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-brand-400);
  background: rgba(59, 130, 246, 0.15);
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
}

/* Placeholder — replace with real screens */
.placeholder-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--space-10) var(--space-12);
  max-width: 480px;
  width: 100%;
  text-align: center;
}

.placeholder-icon {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.placeholder-heading {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.placeholder-body {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.placeholder-checklist {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-align: left;
  font-size: var(--text-sm);
}

.placeholder-checklist li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}

.placeholder-checklist li::before {
  content: '';
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.placeholder-checklist li.done {
  color: var(--color-success);
  background: var(--color-success-bg);
}

.placeholder-checklist li.done::before {
  background: var(--color-success);
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.5 8L6.5 11L12.5 5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.placeholder-checklist li.pending {
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
}

.placeholder-checklist li.pending::before {
  border: 2px solid var(--color-border-strong);
}
</style>
