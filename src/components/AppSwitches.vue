<template>
    <div class="app-switches" :class="isSky ? 'sky-switches' : 'd-flex gap-2'">
        <SegmentSwitch :label="t('lang.label')" :options="langOptions" :model-value="locale" @update:model-value="setLocale" />
        <SegmentSwitch :label="t('theme.label')" :options="themeOptions" :model-value="theme" @update:model-value="setTheme" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import SegmentSwitch from './SegmentSwitch.vue'
import { isSky, setTheme, theme } from '../stores/theme.js'
import { locale, setLocale, t } from '../i18n.js'

const langOptions = [
    { value: 'en', label: 'EN', lang: 'en' },
    { value: 'th', label: 'ไทย', lang: 'th' }
]
const themeOptions = computed(() => [
    { value: 'classic', label: t('theme.classic') },
    { value: 'sky', label: t('theme.sky') }
])
</script>

<style scoped>
.sky-switches { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
