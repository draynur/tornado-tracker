<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <button
    class="w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    :class="modelValue ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
    @click="emit('update:modelValue', !modelValue)"
  >
    {{ modelValue ? 'Heatmap ON' : 'Heatmap OFF' }}
  </button>
</template>
