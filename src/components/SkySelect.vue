<template>
    <div ref="root" class="sky-select" :class="{ open }">
        <button type="button" class="sky-select-button" :aria-label="ariaLabel || undefined" :aria-expanded="open"
            aria-haspopup="listbox" :aria-activedescendant="open ? optionId(activeIndex) : undefined" @click="toggle" @keydown="onKey">
            <span class="sky-select-value">{{ currentLabel }}</span>
            <span class="sky-select-arrow" aria-hidden="true"></span>
        </button>
        <ul v-if="open" class="sky-select-list" role="listbox">
            <li v-for="(option, index) in options" :id="optionId(index)" :key="option.value" role="option"
                :aria-selected="String(option.value) === String(modelValue)"
                :class="{ active: index === activeIndex, selected: String(option.value) === String(modelValue) }"
                @mousemove="activeIndex = index" @click="pick(option)">
                {{ option.label }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
    modelValue: { type: [String, Number], default: '' },
    options: { type: Array, required: true },
    ariaLabel: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const open = ref(false)
const activeIndex = ref(0)
const uid = Math.random().toString(36).slice(2, 8)

const selectedIndex = computed(() => props.options.findIndex((option) => String(option.value) === String(props.modelValue)))
const currentLabel = computed(() => props.options[selectedIndex.value]?.label ?? props.options[0]?.label ?? '')
const optionId = (index) => `sky-option-${uid}-${index}`

const close = () => { open.value = false }
const openList = () => {
    activeIndex.value = Math.max(0, selectedIndex.value)
    open.value = true
}
const toggle = () => (open.value ? close() : openList())
const pick = (option) => {
    emit('update:modelValue', option.value)
    close()
}

const onKey = (event) => {
    const last = props.options.length - 1
    if (event.key === 'Escape') return close()
    if (event.key === 'Tab') return close()
    if (!open.value) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
            event.preventDefault()
            openList()
        }
        return
    }
    if (event.key === 'ArrowDown') { event.preventDefault(); activeIndex.value = activeIndex.value >= last ? 0 : activeIndex.value + 1 }
    else if (event.key === 'ArrowUp') { event.preventDefault(); activeIndex.value = activeIndex.value <= 0 ? last : activeIndex.value - 1 }
    else if (event.key === 'Home') { event.preventDefault(); activeIndex.value = 0 }
    else if (event.key === 'End') { event.preventDefault(); activeIndex.value = last }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pick(props.options[activeIndex.value]) }
}

const onDocument = (event) => {
    if (!root.value?.contains(event.target)) close()
}
watch(open, (isOpen) => {
    if (isOpen) document.addEventListener('mousedown', onDocument)
    else document.removeEventListener('mousedown', onDocument)
})
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocument))
</script>

<style scoped>
.sky-select { position: relative; }
.sky-select-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    min-height: 44px;
    padding: 8px 12px;
    color: var(--ink);
    background: var(--surface);
    border: 1px solid var(--outline-strong);
    border-radius: 12px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: 500;
    text-align: left;
}
.sky-select-button:hover { border-color: var(--sky-deep); }
.sky-select-button:focus-visible { border-color: var(--sky-deep); box-shadow: 0 0 0 3px var(--sky-soft); outline: 0; }
.sky-select-value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sky-select-arrow {
    flex: none;
    width: 9px;
    height: 9px;
    border-right: 2px solid var(--ink-muted);
    border-bottom: 2px solid var(--ink-muted);
    transform: translateY(-2px) rotate(45deg);
    transition: transform 140ms ease;
}
.open .sky-select-arrow { transform: translateY(2px) rotate(225deg); }
.sky-select-list {
    position: absolute;
    z-index: 60;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    max-height: 320px;
    overflow: auto;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: var(--surface);
    border: 1px solid var(--outline-strong);
    border-radius: 14px;
    box-shadow: 0 14px 30px rgba(15, 23, 42, .14);
}
.sky-select-list li {
    padding: 10px 12px;
    color: var(--ink);
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    white-space: nowrap;
}
.sky-select-list li.active { background: var(--sky-soft); }
.sky-select-list li.selected { color: var(--sky-deep); font-weight: 700; }
</style>
