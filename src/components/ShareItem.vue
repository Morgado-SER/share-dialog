<template>
  <div
    class="share-item"
    :class="[
      `share-item--${type.toLowerCase()}`,
      `share-item--${state.toLowerCase()}`,
    ]"
  >
    <!-- Left: radio (Tertiary only) + avatar + text -->
    <div class="share-item__left">
      <RadioButton
        v-if="type === 'Tertiary'"
        :checked="state === 'Selected'"
        :label="name"
        @update:checked="emit('select')"
      />

      <AvatarItem
        :type="avatarType"
        :src="avatarSrc"
        :name="name"
      />

      <div class="share-item__info">
        <p class="share-item__name">{{ name }}</p>
        <div class="share-item__meta">
          <span v-if="tag" class="share-item__badge">{{ tag }}</span>
          <span class="share-item__sub">{{ subText }}</span>
        </div>
      </div>
    </div>

    <!-- Right: action button -->
    <div class="share-item__action">
      <!-- Tertiary: permission dropdown trigger -->
      <button
        v-if="type === 'Tertiary'"
        ref="permBtnRef"
        type="button"
        class="share-item__btn share-item__btn--permission"
        @click.stop="openDropdown"
      >
        <span>{{ permission }}</span>
        <IconChevronDown />
      </button>

      <!-- Secondary: outlined Add button -->
      <button
        v-else
        type="button"
        class="share-item__btn share-item__btn--add"
        @click="emit('add')"
      >
        Add
      </button>
    </div>
  </div>

  <!-- Permission dropdown — teleported to body to escape overflow clipping -->
  <Teleport to="body">
    <div
      v-if="showDropdown"
      class="perm-dropdown"
      :style="dropdownStyle"
      @click.stop
    >
      <!-- Permission options -->
      <div class="perm-dropdown__options">
        <button
          v-for="perm in PERMISSIONS"
          :key="perm"
          type="button"
          class="perm-dropdown__option"
          :class="{ 'perm-dropdown__option--active': perm === permission }"
          @click="selectPermission(perm)"
        >
          <span class="perm-dropdown__option-label">{{ perm }}</span>
          <IconCheck v-if="perm === permission" class="perm-dropdown__check" />
        </button>
      </div>

      <!-- Divider -->
      <div class="perm-dropdown__divider" />

      <!-- Remove — own row container, same structure as permissions block -->
      <div class="perm-dropdown__remove-container">
        <button
          type="button"
          class="perm-dropdown__remove"
          @click="removeRecipient"
        >
          Remove
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import AvatarItem      from './AvatarItem.vue'
import RadioButton     from './RadioButton.vue'
import IconChevronDown from './icons/IconChevronDown.vue'
import IconCheck       from './icons/IconCheck.vue'

const PERMISSIONS = ['Read/display', 'Write/modify', 'Full access', 'Custom']

defineProps({
  type: {
    type: String,
    default: 'Secondary',
    validator: v => ['Tertiary', 'Secondary'].includes(v),
  },
  state: {
    type: String,
    default: 'Default',
    validator: v => ['Default', 'Hover', 'Selected'].includes(v),
  },
  name:       { type: String, default: 'Name' },
  subText:    { type: String, default: '' },
  tag:        { type: String, default: null },
  permission: { type: String, default: 'Read/display' },
  avatarType: { type: String, default: 'User' },
  avatarSrc:  { type: String, default: '' },
})

const emit = defineEmits(['select', 'add', 'update:permission', 'remove'])

// ── Dropdown ──
const showDropdown  = ref(false)
const dropdownStyle = ref({})
const permBtnRef    = ref(null)

function openDropdown() {
  const rect = permBtnRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top:   `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
  showDropdown.value = true
  nextTick(() => {
    document.addEventListener('click', closeDropdown, { once: true })
  })
}

function closeDropdown() {
  showDropdown.value = false
}

function selectPermission(perm) {
  emit('update:permission', perm)
  closeDropdown()
}

function removeRecipient() {
  emit('remove')
  closeDropdown()
}
</script>

<style scoped>
.share-item {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 54px;
  padding: 6px 10px;
  border-radius: var(--radius-lg);
  width: 100%;
  transition: background var(--transition-default);
}

.share-item--tertiary:hover,
.share-item--hover,
.share-item--selected {
  background: #f5f5f5;
}

/* ── Left section ── */
.share-item__left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* ── Info text ── */
.share-item__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.share-item__name {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: 17px;
  color: var(--color-neutral-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.share-item__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.share-item__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e6e9f1;
  color: var(--color-brand-600);
  font-size: 12px;
  font-weight: var(--weight-normal);
  letter-spacing: 0.24px;
  border-radius: 6px;
  padding: 2px 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.share-item__sub {
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: 17px;
  color: var(--color-neutral-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Action buttons ── */
.share-item__action {
  flex-shrink: 0;
}

.share-item__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-brand-600);
  transition: background var(--transition-default), border-color var(--transition-default);
}

/* Permission dropdown trigger (Tertiary) — no border */
.share-item__btn--permission {
  gap: 4px;
  padding: 0 6px 0 8px;
  background: transparent;
}

.share-item__btn--permission:hover {
  background: #e5e5e5;
}

/* Add button (Secondary) — outlined */
.share-item__btn--add {
  padding: 0 8px;
  border: 1px solid #697cac;
  background: transparent;
}

.share-item__btn--add:hover {
  background: var(--color-brand-50);
}
</style>

<!-- Dropdown is teleported to <body> — must be unscoped -->
<style>
.perm-dropdown {
  position: fixed;
  z-index: 200;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 8px;
  /* Figma "Lighter Shadow" */
  box-shadow:
    0px 100px 84px 0px rgba(0, 0, 0, 0.05),
    0px 22.336px 18.762px 0px rgba(0, 0, 0, 0.03),
    0px 6.65px 5.586px 0px rgba(0, 0, 0, 0.02);
  min-width: 160px;
  overflow: hidden;
}

/* ── Permission options block ── */
.perm-dropdown__options {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
}

.perm-dropdown__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #212121;
  background: transparent;
  transition: background 100ms ease;
  white-space: nowrap;
}

.perm-dropdown__option:hover {
  background: #f0f0f0;
}

.perm-dropdown__option--active {
  background: #f3f4f8;
  color: #052474;
}

.perm-dropdown__option--active:hover {
  background: #eaecf3;
}

.perm-dropdown__option-label {
  flex: 1;
  text-align: left;
}

.perm-dropdown__check {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #052474;
}

/* ── Divider ── */
.perm-dropdown__divider {
  height: 1px;
  background: #f0f0f0;
}

/* ── Remove section — mirrors permissions block structure ── */
.perm-dropdown__remove-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  width: 100%;
}

.perm-dropdown__remove {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #d3200e;
  background: transparent;
  transition: background 100ms ease;
  white-space: nowrap;
}

.perm-dropdown__remove:hover {
  background: #fef2f0;
}
</style>
