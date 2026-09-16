<template>
    <button class="auth-bypass sk-btn sk-btn-ghost sk-btn-block" type="button" @click="bypassLogin">{{ t('auth.bypass') }}</button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { t } from '../i18n.js'
import { useAuthStore } from '../stores/authStore.js'

// ponytail: dev-only shortcut while no DB is running; only imported when import.meta.env.DEV.
// The fake session lives in memory, so a page reload signs you out again.
const router = useRouter()
const authStore = useAuthStore()
const bypassLogin = () => {
    authStore.fakeLogin()
    router.push({ name: 'PageMember' })
}
</script>

<style scoped>
.auth-bypass { width: 100%; margin-top: 14px; padding: 10px; color: #6b7780; background: transparent; border: 1px dashed #ccd7d0; border-radius: 5px; cursor: pointer; font-size: 13px; }
:root[data-theme="sky"] .auth-bypass { margin-top: 16px; border-style: dashed; font-size: 16px; }
</style>
