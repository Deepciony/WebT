<template>
    <section class="member-page">
        <div class="member-card sk-panel">
            <div class="member-avatar" aria-hidden="true">{{ initials }}</div>
            <p class="member-kicker sk-kicker">{{ t('profile.kicker') }}</p>
            <h1>{{ member?.memName }}</h1>

            <dl class="member-details">
                <div><dt>{{ t('auth.email') }}</dt><dd>{{ member?.memEmail }}</dd></div>
                <div><dt>{{ t('member.duty') }}</dt><dd><span class="sk-pill">{{ member?.dutyId || '-' }}</span></dd></div>
                <div><dt>{{ t('profile.status') }}</dt><dd class="member-online">{{ t('member.signedIn') }}</dd></div>
            </dl>

            <router-link to="/product" class="member-shop sk-btn sk-btn-block">{{ t('home.browse') }} →</router-link>
            <button class="member-logout sk-btn sk-btn-coral sk-btn-block" type="button" @click="logout">{{ t('profile.logout') }}</button>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { t } from '../i18n.js'

const authStore = useAuthStore()
const router = useRouter()
const member = computed(() => authStore.member)
const initials = computed(() => (member.value?.memName || 'KU').slice(0, 2).toUpperCase())

const logout = async () => {
    if (!window.confirm(t('member.confirmLogout'))) return
    await authStore.memLogout()
    router.push('/login')
}
</script>

<style scoped>
.member-page { display: grid; min-height: 620px; place-items: center; padding: 45px 20px; background: #f4f7f5; }
.member-card { width: min(100%, 440px); padding: 40px; background: #fff; border: 1px solid #dce5df; border-radius: 12px; box-shadow: 0 14px 35px rgba(44, 62, 80, .1); text-align: center; }
.member-avatar { width: 82px; height: 82px; display: grid; place-items: center; margin: 0 auto 20px; color: #fff; background: #198754; border-radius: 50%; font-size: 26px; font-weight: 700; }
.member-kicker { margin-bottom: 8px; color: #198754; font-size: 11px; font-weight: 700; letter-spacing: .15em; }
.member-card h1 { margin: 0 0 24px; color: #2c3e50; font-size: 30px; overflow-wrap: anywhere; }
.member-details { margin: 0 0 25px; border-top: 1px solid #e4ebe7; text-align: left; }
.member-details div { display: flex; justify-content: space-between; gap: 12px; padding: 13px 0; border-bottom: 1px solid #e4ebe7; font-size: 13px; }
.member-details dt { color: #71808a; font-weight: 400; }
.member-details dd { margin: 0; color: #2c3e50; font-weight: 700; overflow-wrap: anywhere; }
.member-online { color: #198754 !important; }
.member-shop { display: block; width: 100%; margin-bottom: 12px; padding: 12px; color: #fff; background: #198754; border-radius: 5px; font-weight: 700; text-decoration: none; }
.member-logout { width: 100%; padding: 12px; color: #c0392b; background: #fff; border: 1px solid #e2b8b2; border-radius: 5px; cursor: pointer; font-weight: 700; }
.member-logout:hover { color: #fff; background: #c0392b; }

/* Skylearn */
:root[data-theme="sky"] .member-page { min-height: calc(100vh - 81px); padding: 48px 20px 96px; background: radial-gradient(circle at 50% 0, var(--sky-soft) 0, transparent 50%); }
:root[data-theme="sky"] .member-card { width: min(100%, 520px); padding: 40px; }
:root[data-theme="sky"] .member-avatar { width: 96px; height: 96px; margin-bottom: 16px; background: var(--sky); border: 3px solid #fff; box-shadow: 0 0 0 2px var(--sky); font-family: var(--font-display); font-size: 32px; }
:root[data-theme="sky"] .member-card h1 { margin: 0 0 32px; color: var(--ink); font-size: 36px; }
:root[data-theme="sky"] .member-details { margin-bottom: 28px; border-color: var(--outline); }
:root[data-theme="sky"] .member-details div { align-items: center; padding: 16px 0; border-color: var(--outline); font-size: 16px; }
:root[data-theme="sky"] .member-details dt { color: var(--ink-muted); }
:root[data-theme="sky"] .member-details dd { color: var(--ink); }
:root[data-theme="sky"] .member-online { color: var(--leaf-ink) !important; }
:root[data-theme="sky"] .member-online::before { content: '●'; margin-right: 6px; font-size: 12px; }
:root[data-theme="sky"] .member-shop { margin-bottom: 12px; }
:root[data-theme="sky"] .member-logout:hover { color: var(--coral-ink); background: var(--coral-soft); }
@media (max-width: 480px) {
    :root[data-theme="sky"] .member-card { padding: 28px 20px; }
}
</style>
