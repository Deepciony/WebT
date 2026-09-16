import { computed, ref, watchEffect } from 'vue'

const readSaved = () => {
    try {
        return localStorage.getItem('kushopTheme')
    } catch {
        return null
    }
}

export const theme = ref(readSaved() === 'classic' ? 'classic' : 'sky')
export const isSky = computed(() => theme.value === 'sky')

watchEffect(() => {
    document.documentElement.dataset.theme = theme.value
    try {
        localStorage.setItem('kushopTheme', theme.value)
    } catch {
        // ponytail: storage blocked, theme still works for this visit
    }
})

export const setTheme = (next) => {
    theme.value = next
}
