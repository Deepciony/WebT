<template>
    <button class="auth-bypass sk-btn sk-btn-ghost sk-btn-block" type="button" @click="openPrompt">{{ t('auth.bypass') }}</button>
    <p v-if="error" class="bypass-error" role="alert">{{ t(error) }}</p>
    <div v-if="promptOpen" class="bypass-overlay" @click.self="closePrompt">
        <form class="bypass-dialog" role="dialog" aria-modal="true" aria-labelledby="bypass-title" @submit.prevent="bypassLogin">
            <h2 id="bypass-title">{{ t('auth.bypassTitle') }}</h2>
            <p>{{ t('auth.bypassCodePrompt') }}</p>
            <label>
                {{ t('auth.bypassCode') }}
                <input v-model="passcode" type="password" inputmode="email" autocomplete="off" autocapitalize="none" spellcheck="false" required autofocus>
            </label>
            <p v-if="error" class="bypass-error" role="alert">{{ t(error) }}</p>
            <div class="bypass-actions">
                <button class="sk-btn sk-btn-ghost" type="button" :disabled="busy" @click="closePrompt">{{ t('db.cancel') }}</button>
                <button class="sk-btn" type="submit" :disabled="busy || !passcode">{{ busy ? t('db.loading') : t('common.confirm') }}</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { t } from '../../i18n.js'
import { useAuthStore } from '../../stores/authStore.js'

// ponytail: dev-only shortcut while no DB is running; only imported when import.meta.env.DEV.
// The fake session lives in memory, so a page reload signs you out again.
const router = useRouter()
const authStore = useAuthStore()
const busy = ref(false)
const error = ref('')
const promptOpen = ref(false)
const passcode = ref('')

const openPrompt = () => {
    error.value = ''
    passcode.value = ''
    promptOpen.value = true
}

const closePrompt = () => {
    if (busy.value) return
    promptOpen.value = false
    passcode.value = ''
    error.value = ''
}

const bypassLogin = async () => {
    if (!passcode.value) return
    busy.value = true
    error.value = ''
    try {
        await axios.post('http://localhost:3000/members/dev-admin', { passcode: passcode.value })
        await authStore.getMember()
        if (!authStore.isLogin || authStore.member?.dutyId !== 'admin') throw new Error('auth.devAdminDisabled')
        promptOpen.value = false
        await router.push({ name: 'PageMember' })
    } catch (err) {
        error.value = err.response?.data?.error || err.message || 'auth.devAdminDisabled'
    } finally {
        busy.value = false
    }
}
</script>

<style scoped>
.auth-bypass { width: 100%; margin-top: 14px; padding: 10px; color: #6b7780; background: transparent; border: 1px dashed #ccd7d0; border-radius: 5px; cursor: pointer; font-size: 13px; }
.bypass-error { margin-top: 8px; color: var(--coral-ink, #b42c2c); font-size: 13px; text-align: center; }
.bypass-overlay { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 16px; background: rgba(15, 23, 42, .5); }
.bypass-dialog { width: min(420px, 100%); padding: 24px; color: var(--ink, #0f172a); background: var(--surface, #fff); border: 1px solid var(--outline, #e2e8f0); border-radius: var(--r-card, 12px); box-shadow: var(--shadow-active, 0 12px 32px rgba(15, 23, 42, .15)); text-align: left; }
.bypass-dialog h2 { margin: 0 0 8px; font-size: 24px; }
.bypass-dialog > p { margin: 0 0 18px; color: var(--ink-muted, #475569); }
.bypass-dialog label { display: block; color: var(--ink-muted, #475569); font-size: 14px; font-weight: 700; }
.bypass-dialog input { display: block; width: 100%; min-height: 48px; margin-top: 6px; padding: 0 12px; color: var(--ink, #0f172a); background: var(--surface, #fff); border: 1px solid var(--outline-strong, #94a3b8); border-radius: var(--r-input, 8px); font: inherit; }
.bypass-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.bypass-actions .sk-btn { min-height: 44px; padding: 8px 18px; font-size: 15px; }
:root[data-theme="sky"] .auth-bypass { margin-top: 16px; border-style: dashed; font-size: 16px; }
</style>
