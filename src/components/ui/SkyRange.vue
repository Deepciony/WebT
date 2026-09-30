<template>
    <div class="sky-range">
        <SkySelect :model-value="selected" :options="rangeOptions" :aria-label="ariaLabel" @update:model-value="pickRange" />
        <div v-if="selected === 'custom'" class="sky-range-custom">
            <input :value="min" type="number" min="0" :step="step" :placeholder="t('filter.minShort')"
                :aria-label="t('filter.minShort')" @input="emit('update:min', $event.target.value)">
            <span aria-hidden="true">–</span>
            <input :value="max" type="number" min="0" :step="step" :placeholder="t('filter.maxShort')"
                :aria-label="t('filter.maxShort')" @input="emit('update:max', $event.target.value)">
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import SkySelect from './SkySelect.vue'
import { t } from '../../i18n.js'

const props = defineProps({
    min: { type: [String, Number], default: '' },
    max: { type: [String, Number], default: '' },
    presets: { type: Array, required: true },
    prefix: { type: String, default: '$' },
    step: { type: String, default: '0.01' },
    ariaLabel: { type: String, default: '' }
})
const emit = defineEmits(['update:min', 'update:max'])

const custom = ref(false)
const money = (value) => `${props.prefix}${Number(value).toLocaleString()}`

const presetLabel = (preset) => {
    if (preset.min === undefined) return t('filter.rangeUnder', { value: money(preset.max) })
    if (preset.max === undefined) return t('filter.rangeOver', { value: money(preset.min) })
    return t('filter.rangeBetween', { from: money(preset.min), to: money(preset.max) })
}

const matched = computed(() => props.presets.findIndex((preset) =>
    String(preset.min ?? '') === String(props.min) && String(preset.max ?? '') === String(props.max)))

const selected = computed(() => {
    if (custom.value) return 'custom'
    if (props.min === '' && props.max === '') return 'all'
    return matched.value === -1 ? 'custom' : String(matched.value)
})

const rangeOptions = computed(() => [
    { value: 'all', label: t('filter.priceAny') },
    ...props.presets.map((preset, index) => ({ value: String(index), label: presetLabel(preset) })),
    { value: 'custom', label: t('filter.rangeCustom') }
])

const pickRange = (value) => {
    if (value === 'custom') {
        custom.value = true
        return
    }
    custom.value = false
    const preset = value === 'all' ? {} : props.presets[Number(value)]
    emit('update:min', preset.min === undefined ? '' : String(preset.min))
    emit('update:max', preset.max === undefined ? '' : String(preset.max))
}

// a parent "clear filters" wipes both ends, so leave custom mode with it
watch(() => [props.min, props.max], ([min, max]) => {
    if (min === '' && max === '') custom.value = false
})
</script>

<style scoped>
.sky-range { display: flex; flex-direction: column; gap: 8px; }
.sky-range-custom { display: flex; align-items: center; gap: 8px; }
.sky-range-custom input { width: 100%; min-width: 0; }
.sky-range-custom span { color: var(--ink-muted); }
</style>
