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
            <div class="product-foot">
                <strong class="sk-mono">${{ Number(product.pdPrice).toFixed(2) }}</strong>
                <button class="sk-btn" :class="{ 'sk-btn-leaf': added }" type="button" @click="add">
                    <SkyIcon :name="added ? 'check' : 'cart'" :size="22" />
                    <span>{{ t(added ? 'product.added' : 'product.add') }}</span>
                </button>
            </div>
            <p class="visually-hidden" aria-live="polite">{{ added ? t('product.addedLive', { name: product.pdName }) : '' }}</p>
        </div>
    </article>
</template>

<script setup>
import { ref } from 'vue'
import SkyIcon from './SkyIcon.vue'
import { addToCart } from '../stores/cart.js'
import { t } from '../i18n.js'

const props = defineProps({ product: { type: Object, required: true } })
const added = ref(false)
let timer

const add = () => {
    addToCart(props.product)
    added.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { added.value = false }, 1600)
}
</script>

<style scoped>
.product-card { display: flex; flex-direction: column; overflow: hidden; }
.product-image { position: relative; min-height: 0; overflow: hidden; aspect-ratio: 4 / 3; margin: 12px 12px 0; background: var(--sunken); border-radius: 14px; }
.product-image img { position: absolute; inset: 0; width: 100%; height: 100%; padding: 16px; object-fit: contain; }
.product-body { display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 8px; padding: 20px 24px 24px; }
.product-body h3 { margin: 4px 0 0; font-family: var(--font-body); font-size: 20px; font-weight: 700; line-height: 1.35; }
.product-remark { display: -webkit-box; overflow: hidden; margin: 0; color: var(--ink-muted); font-size: 16px; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.product-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; width: 100%; margin-top: auto; padding-top: 16px; }
.product-foot strong { font-size: 24px; }
.product-foot .sk-btn { padding: 0 20px; }
</style>
