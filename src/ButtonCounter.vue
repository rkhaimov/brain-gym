<script setup lang="ts">
import { useMouse } from '@/useMouse.ts';
import { computed, inject, nextTick, onUpdated, reactive, shallowRef } from 'vue';

/**
 * TODO: Can not be used inside a function (and other macros as well).
 * It is probably due to compiler ignoring calls outside of .vue files
 */
defineProps<{ title: string }>();

// TODO: Why it is not required event
const emits = defineEmits<{ increment: [] }>();

/**
 * Refs create dependencies (for view to rerender).
 * Implement set and get logic (does it recursively to proxy all probable mutations).
 * Compares values via Object.is method (compare targets depend on strategy used (common or shallow)).
 * Certain properties can be marked as readonly. Can also make complex deep objects to be reactive by marking all properties
 * upon reading (or setting?)
 *
 * Updates whole component.
 *
 * When wrapped in plain object, do not trigger updates:
 * const obj = { id: ref(0) };
 *
 * obj.id = 1; // Will not trigger anything because obj is not a proxy
 */
// TODO: How to sync prop with inner state
const count = shallowRef(0);

async function increment() {
  count.value += 1;

  // Allows to wait until all DOM updates are applied
  await nextTick();

  emits('increment');
}


/**
 * Ref itself, caches last result based on used ref state.
 *
 * TODO: What if refs are used conditionally? Is linking also happens in this way?
 */
const output = computed(() => count.value * 2);

/**
 * Props are shallow reactive by default.
 * Compares each property of an object with Object.is without going deep.
 *
 * Not destructure-friendly. Primitives, when stored on separate var do not trigger
 * Proxy[set] when mutated, because they are copied by value.
 */
const state = reactive({ message: 'Message in a state' });
const global = inject('message');

const { x, y } = useMouse();
</script>

<template>
  <!--  With this placeholders we define where certain template vars will be placed. It is so called "default" slot-->
  <slot secret="MY LITTLE SECRET" />
  <button @click="increment" :class="{ active: output === 0 }">
    {{ output }} - {{ title }}
  </button>
  <span>{{ global }}</span>
  <p>{{ x }}:{{ y }}</p>
</template>
