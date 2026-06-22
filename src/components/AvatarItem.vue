<template>
  <div class="avatar-item" :class="`avatar-item--${type.toLowerCase()}`">
    <img
      v-if="type === 'Avatar'"
      :src="src"
      :alt="name"
      class="avatar-item__photo"
    />
    <IconUser      v-else-if="type === 'User'"  class="avatar-item__icon" />
    <IconGroup     v-else-if="type === 'Group'" class="avatar-item__icon" />
    <IconUnit      v-else-if="type === 'Unit'"  class="avatar-item__icon" />
    <IconRole      v-else-if="type === 'Role'"  class="avatar-item__icon" />
  </div>
</template>

<script setup>
import IconUser  from './icons/IconUser.vue'
import IconGroup from './icons/IconGroup.vue'
import IconUnit  from './icons/IconUnit.vue'
import IconRole  from './icons/IconRole.vue'

defineProps({
  /** Which variant to render */
  type: {
    type: String,
    default: 'User',
    validator: v => ['Avatar', 'User', 'Group', 'Unit', 'Role'].includes(v),
  },
  /** Photo URL — only used when type === 'Avatar' */
  src: {
    type: String,
    default: '',
  },
  /** Name for img alt text */
  name: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.avatar-item {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-full);
  border: 1.312px solid #f0f0f0;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Photo variant — white bg */
.avatar-item--avatar {
  background: var(--color-neutral-0);
}

.avatar-item__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

/* Icon variants — light gray bg */
.avatar-item--user,
.avatar-item--group,
.avatar-item--unit,
.avatar-item--role {
  background: #e5e5e5;
}

.avatar-item__icon {
  width: 28px;
  height: 28px;
  color: var(--color-neutral-500);
}
</style>
