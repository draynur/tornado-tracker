<script setup lang="ts">
const props = defineProps<{
  modelValue: [number, number]
  min?: number
  max?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: [number, number]]
}>()

const minYear = props.min ?? 1950
const maxYear = props.max ?? 2019

function updateMin(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  const clamped = Math.min(val, props.modelValue[1])
  emit('update:modelValue', [clamped, props.modelValue[1]])
}

function updateMax(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  const clamped = Math.max(val, props.modelValue[0])
  emit('update:modelValue', [props.modelValue[0], clamped])
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex justify-between text-xs text-gray-400">
      <span>{{ modelValue[0] }}</span>
      <span>{{ modelValue[1] }}</span>
    </div>
    <div class="relative h-5">
      <input
        type="range"
        :min="minYear"
        :max="maxYear"
        :value="modelValue[0]"
        class="range-input absolute w-full"
        @input="updateMin"
      />
      <input
        type="range"
        :min="minYear"
        :max="maxYear"
        :value="modelValue[1]"
        class="range-input absolute w-full"
        @input="updateMax"
      />
    </div>
    <div class="flex justify-between text-xs text-gray-500">
      <span>{{ minYear }}</span>
      <span>{{ maxYear }}</span>
    </div>
  </div>
</template>

<style scoped>
.range-input {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: transparent;
  pointer-events: none;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  pointer-events: all;
  cursor: pointer;
  border: 2px solid #1e40af;
}

.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  pointer-events: all;
  cursor: pointer;
  border: 2px solid #1e40af;
}

.range-input::-webkit-slider-runnable-track {
  background: #374151;
  height: 4px;
  border-radius: 2px;
}

.range-input::-moz-range-track {
  background: #374151;
  height: 4px;
  border-radius: 2px;
}
</style>
