<template>
    <section class="detail-page sk-page">
        <router-link to="/product" class="detail-back">{{ t('detail.back') }}</router-link>

        <p v-if="loading" class="detail-state" aria-busy="true">{{ t('db.loading') }}</p>
        <div v-else-if="!product" class="detail-state sk-empty">
            <h2>{{ t('detail.notFound') }}</h2>
            <router-link to="/product" class="sk-btn">{{ t('shop.showAll') }}</router-link>
        </div>

        <article v-else class="detail-layout">
            <div class="detail-image sk-card">
                <img :src="imageSrc" :alt="product.pdName">
            </div>

            <div class="detail-info">
                <p class="sk-kicker">{{ t('detail.kicker') }}</p>
                <h1>{{ product.pdName }}</h1>
                <p class="detail-price sk-mono">${{ Number(product.pdPrice).toFixed(2) }}</p>

                <dl class="detail-table">
                    <div><dt>{{ t('detail.id') }}</dt><dd class="sk-mono">{{ product.pdId }}</dd></div>
                    <div><dt>{{ t('detail.brand') }}</dt><dd>{{ product.brand?.brandName || t('product.noBrand') }}</dd></div>
                    <div v-if="product.pdt?.pdTypeName"><dt>{{ t('detail.type') }}</dt><dd>{{ product.pdt.pdTypeName }}</dd></div>
                    <div><dt>{{ t('detail.remark') }}</dt><dd>{{ product.pdRemark || '-' }}</dd></div>
                </dl>

                <div class="detail-actions">
                    <button class="sk-btn sk-btn-big" type="button" :disabled="busy" @click="addToCart">
                        <SkyIcon :name="added ? 'check' : 'cart'" :size="22" />
                        {{ t(added ? 'product.added' : 'product.add') }}
                    </button>
                    <router-link to="/manage" class="sk-btn sk-btn-big sk-btn-ghost">
                        <SkyIcon name="pencil" :size="22" /> {{ t('manage.edit') }}
                    </router-link>
                </div>

                <p v-if="message" class="sk-msg error" role="status">{{ t(message) }}</p>
                <p v-else-if="added" class="sk-msg" role="status">{{ t('product.addedLive', { name: product.pdName }) }}</p>
            </div>
        </article>
    </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '../stores/cartStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { t } from '../i18n.js'
import SkyIcon from './SkyIcon.vue'

const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

const product = ref(null)
const loading = ref(true)
const busy = ref(false)
const added = ref(false)
const message = ref('')

const imageSrc = computed(() => product.value?.logosrc
    ? `http://localhost:3000${product.value.logosrc}`
    : `http://localhost:3000/products/${product.value?.pdId}/image`)

onMounted(async () => {
    try {
        // Backend answers with an array of matching rows
        const res = await axios.get(`http://localhost:3000/products/${route.params.pdId}`)
        product.value = res.data[0] || null
    } catch (err) {
        console.log(err.message)
    } finally {
        loading.value = false
    }
})

const addToCart = async () => {
    if (!authStore.isLogin) {
        message.value = 'product.loginFirst'
        added.value = false
        return
    }
    busy.value = true
    try {
        await cartStore.addProduct(product.value)
        added.value = true
        message.value = ''
    } catch (err) {
        console.log(err.message)
        added.value = false
        message.value = 'product.addFail'
    } finally {
        busy.value = false
    }
}
</script>

<style scoped>
.detail-page { max-width: 1100px; }
.detail-back { display: inline-block; margin-bottom: 20px; color: #198754; font-weight: 700; text-decoration: none; }
.detail-state { padding: 48px 0; text-align: center; }
.detail-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: start; }
.detail-image { display: grid; place-items: center; overflow: hidden; aspect-ratio: 1; padding: 24px; background: #f4f7f5; border: 1px solid #dce5df; border-radius: 12px; }
.detail-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
.detail-info h1 { margin: 4px 0 8px; color: #2c3e50; font-size: 32px; }
.detail-price { margin: 0 0 24px; color: #198754; font-size: 28px; font-weight: 700; }
.detail-table { margin: 0 0 28px; border-top: 1px solid #e4ebe7; }
.detail-table div { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e4ebe7; }
.detail-table dt { color: #71808a; font-size: 14px; }
.detail-table dd { margin: 0; color: #2c3e50; font-weight: 700; text-align: right; overflow-wrap: anywhere; }
.detail-actions { display: flex; flex-wrap: wrap; gap: 12px; }

/* Skylearn */
:root[data-theme="sky"] .detail-back { color: var(--sky-deep); }
:root[data-theme="sky"] .detail-back:hover { text-decoration: underline; }
:root[data-theme="sky"] .detail-image { background: var(--surface); border-color: var(--outline); border-radius: var(--r-card); }
:root[data-theme="sky"] .detail-info h1 { color: var(--ink); font-size: clamp(30px, 4vw, 40px); }
:root[data-theme="sky"] .detail-price { color: var(--sky-deep); font-size: 32px; }
:root[data-theme="sky"] .detail-table { border-color: var(--outline); }
:root[data-theme="sky"] .detail-table div { padding: 16px 0; border-color: var(--outline); }
:root[data-theme="sky"] .detail-table dt { color: var(--ink-muted); font-size: 16px; }
:root[data-theme="sky"] .detail-table dd { color: var(--ink); }
@media (max-width: 800px) {
    .detail-layout { grid-template-columns: 1fr; gap: 24px; }
    .detail-actions .sk-btn { width: 100%; }
}
</style>
