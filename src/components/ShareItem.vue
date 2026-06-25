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
      <!-- Tertiary: text button with chevron (permission dropdown) -->
      <button
        v-if="type === 'Tertiary'"
        type="button"
        class="share-item__btn share-item__btn--permission"
        @click="emit('permission')"
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
</template>

<script setup>
import AvatarItem      from './AvatarItem.vue'
import RadioButton     from './RadioButton.vue'
import IconChevronDown from './icons/IconChevronDown.vue'

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
  /** Text shown below the name: email for people, "N members" for groups/units/roles */
  subText:    { type: String, default: '' },
  /** Badge label (Group / Unit / Role). Null/empty = no badge shown. */
  tag:        { type: String, default: null },
  /** Permission label for Tertiary type */
  permission: { type: String, default: 'Read' },
  avatarType: { type: String, default: 'User' },
  avatarSrc:  { type: String, default: '' },
})

const emit = defineEmits(['select', 'add', 'permission'])
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

/* Permission dropdown (Tertiary) — no border */
.share-item__btn--permission {
  gap: 4px;
  padding: 0 6px 0 8px;
  background: transparent;
}

.share-item__btn--permission:hover {
  background: var(--color-brand-50);
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
