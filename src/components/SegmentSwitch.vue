<template>
    <div class="segment-switch" :class="isSky ? 'is-sky' : 'btn-group btn-group-sm'" role="group" :aria-label="label">
        <button v-for="option in options" :key="option.value" type="button"
            :class="isSky ? { active: modelValue === option.value } : ['btn', modelValue === option.value ? 'btn-dark' : 'btn-outline-dark']"
            :aria-pressed="modelValue === option.value" :lang="option.lang"
            @click="emit('update:modelValue', option.value)">
            {{ option.label }}
        </button>
    </div>
</template>

<script setup>
import { isSky } from '../stores/theme.js'

defineProps({
    label: { type: String, required: true },
    options: { type: Array, required: true },
    modelValue: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.is-sky {
    display: inline-flex;
    gap: 2px;
    padding: 4px;
    background: var(--sunken);
    border: 1px solid var(--outline);
    border-radius: 999px;
}
.is-sky button {
    min-height: 44px;
    padding: 0 14px;
    color: var(--ink-muted);
    background: transparent;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    transition: background var(--dur) var(--ease), color var(--dur);
}
.is-sky button:hover { color: var(--ink); }
.is-sky button.active { color: #fff; background: var(--sky); box-shadow: 0 4px 12px rgba(8, 127, 115, .3); }
@media (max-width: 560px) {
    .is-sky button { padding: 0 11px; }
}
</style>
