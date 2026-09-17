<template>
    <div v-if="isSky" class="sk-page">
        <header class="shop-head">
            <div class="sk-head">
                <p class="sk-kicker">{{ t('shop.kicker') }}</p>
                <h1>{{ t('shop.title') }}</h1>
                <p>{{ t('shop.lead') }}</p>
            </div>
            <form class="search sk-form" role="search" @submit.prevent="searchProducts">
                <label class="search-field">
                    <span class="visually-hidden">{{ t('shop.searchLabel') }}</span>
                    <SkyIcon name="search" class="search-icon" />
                    <input v-model="stext" type="search" :placeholder="t('shop.placeholder')">
                </label>
                <button class="sk-btn" type="submit">{{ t('shop.search') }}</button>
            </form>
        </header>

        <p v-if="!loading && !error" class="result-count" aria-live="polite">
            <template v-if="searched">{{ t('shop.resultsFor', { q: searched }) }}</template>
            {{ t('shop.found') }} <strong class="sk-mono">{{ product.length }}</strong> {{ t('shop.items') }}
            <button v-if="searched" class="clear-search" type="button" @click="clearSearch">{{ t('shop.clear') }}</button>
        </p>

        <div v-if="loading" class="product-grid" aria-busy="true">
            <div v-for="n in 6" :key="n" class="skeleton-card sk-skeleton"></div>
        </div>
        <div v-else-if="error" class="sk-empty">
            <span class="sk-empty-icon"><SkyIcon name="refresh" :size="32" /></span>
            <h2>{{ t('common.loadFail') }}</h2>
            <p>{{ t('common.loadFailText') }}</p>
            <button class="sk-btn" type="button" @click="searchProducts"><SkyIcon name="refresh" /> {{ t('common.retry') }}</button>
        </div>
        <div v-else-if="product.length" class="product-grid">
            <ProductCard v-for="pd in product" :key="pd.pdId" :product="pd" />
        </div>
        <div v-else class="sk-empty">
            <span class="sk-empty-icon"><SkyIcon name="search" :size="32" /></span>
            <h2>{{ t('shop.noMatch', { q: searched }) }}</h2>
            <p>{{ t('shop.noMatchText') }}</p>
            <button class="sk-btn" type="button" @click="clearSearch">{{ t('shop.showAll') }}</button>
        </div>
    </div>

    <template v-else>
        <form @submit.prevent="searchProducts">
            <div class="row">
                <div class="h1 col-md-6 col-sm-12text-danger">{{ t('shop.title') }}</div>
                <div class="col-md-4 col-sm-6">
                    <input type="text" class="form-control" v-model="stext" :placeholder="t('shop.placeholder')">
                </div>
                <div class="col">
                    <button class="btn btn-primary" type="submit">{{ t('shop.search') }}</button>
                </div>
            </div>
        </form>
        <div class="row">
            <div v-for="(pd,pdId) in product" :key="pdId" class="col-lg-4 col-md-6 col-sm-12">
                <div class="card mt-3" style="width: 18rem; background-color: #EEEEEE; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <img :src="pd.logosrc ? `http://localhost:3000${pd.logosrc}` : `http://localhost:3000/products/${pd.pdId}/image`" class="card-img-top p-2" :alt="t('product.imgAlt')">
                    <div class="card-body">
                        <h5 class="card-title">{{ pd.pdName }}</h5>
                        <p class="card-text">{{ pd.brand?.brandName || t('product.noBrand') }} - ${{ pd.pdPrice }}</p>
                        <button class="btn btn-primary" type="button" @click="addProduct(pd)">{{ t('product.add') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </template>
</template>

<script setup>
    import { onMounted, ref } from 'vue';
    import axios from 'axios';
    import { addToCart } from '../stores/cart.js';
    import { isSky } from '../stores/theme.js';
    import { t } from '../i18n.js';
    import ProductCard from './ProductCard.vue';
    import SkyIcon from './SkyIcon.vue';

    const product = ref([])
    const stext = ref('')
    const searched = ref('')
    const loading = ref(true)
    const error = ref(false)
    const addProduct = (pd) => addToCart(pd)

    const searchProducts = async () => {
        const keyword = stext.value.trim()
        const endpoint = keyword
            ? `http://localhost:3000/search/products/${encodeURIComponent(keyword)}`
            : 'http://localhost:3000/products'

        loading.value = true
        error.value = false
        try {
            const res = await axios.get(endpoint)
            product.value = res.data
            searched.value = keyword
        } catch (err) {
            console.log(err)
            error.value = true
        } finally {
            loading.value = false
        }
    }

    const clearSearch = () => {
        stext.value = ''
        searchProducts()
    }

    onMounted(searchProducts)

</script>

<style scoped>
.shop-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
.shop-head .sk-head { margin-bottom: 0; }
.search { display: flex; flex: 1 1 420px; gap: 12px; max-width: 560px; }
.search-field { position: relative; flex: 1; margin: 0 !important; }
.search-field input { margin: 0 !important; padding-left: 52px !important; }
.search-icon { position: absolute; top: 50%; left: 18px; color: var(--ink-subtle); transform: translateY(-50%); pointer-events: none; }
.result-count { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin: 0 0 24px; color: var(--ink-muted); }
.result-count strong { color: var(--ink); }
.clear-search { min-height: 44px; padding: 0 12px; color: var(--sky-deep); background: none; border: 0; border-radius: 12px; cursor: pointer; font-weight: 700; text-decoration: underline; }
.clear-search:hover { background: var(--sky-soft); }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 32px; }
.skeleton-card { height: 440px; border-radius: var(--r-card); }

@media (max-width: 640px) {
    .search { flex-basis: 100%; }
    .product-grid { gap: 20px; }
}
</style>
