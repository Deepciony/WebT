<template>
    <section class="auth-page">
        <div v-if="!isSky" class="auth-intro">
            <p class="auth-kicker">{{ t('auth.kicker') }}</p>
            <h1>{{ heading }}<br><em>{{ highlight }}</em></h1>
            <p>{{ t('auth.intro') }}</p>
        </div>

        <AppSwitches v-if="isSky" class="auth-switches" />

        <div class="auth-card sk-panel sk-form">
            <div v-if="isSky" class="auth-brand">
                <img class="auth-brand-logo" src="http://localhost:3000/img_pd/LogoSRC.png" alt="KUSHOP">
                <small>{{ t('store.name') }}</small>
            </div>
            <slot />
        </div>
    </section>
</template>

<script setup>
import AppSwitches from './AppSwitches.vue'
import { isSky } from '../stores/theme.js'
import { t } from '../i18n.js'

defineProps({
    heading: { type: String, required: true },
    highlight: { type: String, required: true }
})
</script>

<style scoped>
.auth-page { display: grid; grid-template-columns: 1fr minmax(340px, 440px); gap: 70px; align-items: center; min-height: 650px; padding: 50px 4%; background: linear-gradient(120deg, #f7f8f5, #eef5f0); }
.auth-intro { max-width: 520px; }
.auth-kicker { margin-bottom: 18px; color: #198754; font-size: 12px; font-weight: 700; letter-spacing: .16em; }
.auth-intro h1 { margin: 0 0 20px; color: #2c3e50; font-size: clamp(42px, 6vw, 72px); line-height: .95; }
.auth-intro h1 em { color: #198754; font-style: normal; }
.auth-intro > p:last-child { max-width: 390px; color: #6b7780; font-size: 16px; }
.auth-card { padding: 28px; background: #fff; border: 1px solid #dce5df; border-radius: 12px; box-shadow: 0 14px 35px rgba(44, 62, 80, .1); }
.auth-card :slotted(h2) { margin: 0 0 22px; color: #2c3e50; font-size: 25px; }
.auth-card :slotted(label) { display: block; margin-bottom: 15px; color: #47545b; font-size: 13px; font-weight: 700; }
.auth-card :slotted(input) { display: block; width: 100%; margin-top: 6px; padding: 11px 12px; border: 1px solid #ccd7d0; border-radius: 5px; outline: 0; }
.auth-card :slotted(input:focus) { border-color: #198754; box-shadow: 0 0 0 3px rgba(25, 135, 84, .12); }
.auth-card :slotted(.auth-submit) { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding: 12px 15px; color: #fff; background: #198754; border: 0; border-radius: 5px; cursor: pointer; font-weight: 700; }
.auth-card :slotted(.auth-message) { margin: 17px 0 0; color: #198754; font-size: 13px; }
.auth-card :slotted(.auth-message.error) { color: #c0392b; }
.auth-card :slotted(.auth-switch-link) { display: block; margin-top: 18px; color: #198754; font-size: 13px; font-weight: 700; text-align: center; text-decoration: none; }
@media (max-width: 760px) { .auth-page { grid-template-columns: 1fr; gap: 28px; min-height: auto; padding: 35px 20px 50px; } .auth-intro h1 { font-size: 48px; } }

/* Skylearn: standalone auth page, card only */
:root[data-theme="sky"] .auth-page {
    position: relative;
    grid-template-columns: minmax(0, 480px);
    place-content: center;
    gap: 0;
    min-height: 100vh;
    padding: 48px 20px;
    background:
        radial-gradient(circle at 15% 15%, var(--sky-soft) 0, transparent 38%),
        radial-gradient(circle at 85% 90%, var(--leaf-soft) 0, transparent 34%),
        var(--bg);
}
:root[data-theme="sky"] .auth-switches { position: absolute; top: 24px; right: 28px; z-index: 2; }
:root[data-theme="sky"] .auth-card { padding: 40px; animation: sk-pop 480ms var(--ease); }
:root[data-theme="sky"] .auth-brand { display: grid; justify-items: center; gap: 4px; margin-bottom: 28px; text-align: center; }
:root[data-theme="sky"] .auth-brand-logo { display: block; width: min(100%, 320px); height: auto; margin-bottom: 12px; padding: 0; background: transparent !important; border: 0; border-radius: 0; box-shadow: none !important; object-fit: contain; }
:root[data-theme="sky"] .auth-brand strong { color: var(--ink); font-family: var(--font-brand); font-size: 30px; font-weight: 700; letter-spacing: .02em; }
:root[data-theme="sky"] .auth-brand small { color: var(--ink-muted); font-size: 16px; }
:root[data-theme="sky"] .auth-card :slotted(h2) { margin: 0 0 20px; color: var(--ink); font-size: 26px; }
:root[data-theme="sky"] .auth-card :slotted(.auth-submit) { justify-content: center; margin-top: 8px; }
:root[data-theme="sky"] .auth-card :slotted(.auth-switch-link) { display: flex; align-items: center; justify-content: center; min-height: 56px; margin-top: 12px; color: var(--sky-deep); border-radius: var(--r-btn); font-size: 16px; }
:root[data-theme="sky"] .auth-card :slotted(.auth-switch-link:hover) { background: var(--sky-soft); }
:root[data-theme="sky"] .auth-card :slotted(.auth-home-link) { display: flex; align-items: center; justify-content: center; min-height: 44px; margin-top: 8px; color: var(--ink-muted); border-radius: var(--r-btn); font-size: 15px; text-decoration: none; }
:root[data-theme="sky"] .auth-card :slotted(.auth-home-link:hover) { color: var(--sky-deep); background: var(--sunken); }
@media (max-width: 480px) {
    :root[data-theme="sky"] .auth-page { place-content: start stretch; padding: 88px 16px 24px; }
    :root[data-theme="sky"] .auth-switches { top: 16px; right: 16px; }
    :root[data-theme="sky"] .auth-card { padding: 28px 20px; }
}
</style>
