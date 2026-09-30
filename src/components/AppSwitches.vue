<template>
    <div class="app-switches">
        <SegmentSwitch :label="t('lang.label')" :options="langOptions" :model-value="locale" @update:model-value="setLocale" />
    </div>
</template>

<script setup>
import SegmentSwitch from './SegmentSwitch.vue'
import { locale, setLocale, t } from '../i18n.js'

const langOptions = [
    { value: 'en', label: 'EN', lang: 'en' },
    { value: 'th', label: 'ไทย', lang: 'th' }
]
</script>

<style scoped>
.app-switches { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
