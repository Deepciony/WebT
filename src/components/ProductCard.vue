<template>
    <article class="product-card sk-card sk-card-lift">
        <div class="product-image">
            <img :src="product.logosrc ? `http://localhost:3000${product.logosrc}` : `http://localhost:3000/products/${product.pdId}/image`"
                :alt="product.pdName" loading="lazy">
        </div>
        <div class="product-body">
            <span class="sk-pill">{{ product.brand?.brandName || t('product.noBrand') }}</span>
            <h3>{{ product.pdName }}</h3>
            <p v-if="product.pdRemark" class="product-remark">{{ product.pdRemark }}</p>
            <router-link :to="{ name: 'ProductShow', params: { pdId: product.pdId } }" class="product-detail-link">{{ t('product.detail') }} →</router-link>
            <div class="product-foot">
                <strong class="sk-mono">${{ Number(product.pdPrice).toFixed(2) }}</strong>
                <button class="sk-btn" type="button" :disabled="busy" @click="add">
                    <SkyIcon :name="added ? 'check' : 'cart'" :size="22" />
                    <span>{{ t(added ? 'product.added' : 'product.add') }}</span>
                </button>
            </div>
            <p class="visually-hidden" aria-live="polite">{{ added ? t('product.addedLive', { name: product.pdName }) : '' }}</p>
        </div>
    </article>

    <div v-if="notice.open" class="notice-overlay" @click.self="closeNotice">
        <div class="notice-dialog" role="dialog" aria-modal="true" aria-labelledby="product-notice-title">
            <h3 id="product-notice-title">{{ notice.title }}</h3>
            <p>{{ notice.message }}</p>
            <button type="button" class="sk-btn" @click="closeNotice">{{ t('common.close') }}</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import SkyIcon from './SkyIcon.vue'
import { useCartStore } from '../stores/cartStore.js'
import { t } from '../i18n.js'

const props = defineProps({ product: { type: Object, required: true } })
const cartStore = useCartStore()
const added = ref(false)
const busy = ref(false)
const notice = ref({ open: false, title: '', message: '' })
let timer

const add = async () => {
    busy.value = true
    try {
        await cartStore.addProduct(props.product)
        added.value = true
        clearTimeout(timer)
        timer = setTimeout(() => { added.value = false }, 1600)
    } catch (err) {
        console.log(err.message)
        notice.value = { open: true, title: t('product.addFailTitle'), message: t('product.addFail') }
    } finally {
        busy.value = false
    }
}

const closeNotice = () => {
    notice.value = { open: false, title: '', message: '' }
}
</script>

<style scoped>
.product-card { display: flex; flex-direction: column; overflow: hidden; }
.product-image { position: relative; min-height: 0; overflow: hidden; aspect-ratio: 4 / 3; margin: 12px 12px 0; background: var(--sunken); border-radius: 14px; }
.product-image img { position: absolute; inset: 0; width: 100%; height: 100%; padding: 16px; object-fit: contain; }
.product-body { display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 8px; padding: 20px 24px 24px; }
.product-body h3 { margin: 4px 0 0; font-family: var(--font-body); font-size: 20px; font-weight: 700; line-height: 1.35; }
.product-remark { display: -webkit-box; overflow: hidden; margin: 0; color: var(--ink-muted); font-size: 16px; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.product-detail-link { color: var(--sky-deep, #198754); font-size: 15px; font-weight: 700; text-decoration: none; }
.product-detail-link:hover { text-decoration: underline; }
.product-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; width: 100%; margin-top: auto; padding-top: 16px; }
.product-foot strong { font-size: 24px; }
.product-foot .sk-btn { padding: 0 20px; }
.product-card .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
.notice-overlay { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; background: rgba(15, 23, 42, .5); }
.notice-dialog { width: min(380px, calc(100vw - 32px)); padding: 24px; color: var(--ink); background: var(--surface); border: 1px solid var(--outline); border-radius: var(--r-card); box-shadow: var(--shadow-active); }
.notice-dialog h3 { margin: 0 0 8px; font-size: 22px; }
.notice-dialog p { margin: 0 0 20px; color: var(--ink-muted); }
.notice-dialog .sk-btn { width: 100%; }
</style>
