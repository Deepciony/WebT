<template>
    <div class="sk-page">
        <header class="shop-head">
            <div class="sk-head">
                <p class="sk-kicker">{{ t('shop.kicker') }}</p>
                <h1>{{ t('shop.title') }}</h1>
                <p>{{ t('shop.lead') }}</p>
            </div>
        </header>

        <div class="sk-filters" role="group" :aria-label="t('filter.title')">
            <div class="filter-field grow">
                <span class="filter-label">{{ t('filter.brand') }}</span>
                <SkySelect v-model="filters.brandId" :options="brandOptions" :aria-label="t('filter.brand')" />
            </div>
            <div class="filter-field grow">
                <span class="filter-label">{{ t('filter.type') }}</span>
                <SkySelect v-model="filters.pdTypeId" :options="typeOptions" :aria-label="t('filter.type')" />
            </div>
            <div class="filter-field grow">
                <span class="filter-label">{{ t('filter.price') }}</span>
                <SkyRange v-model:min="filters.minPrice" v-model:max="filters.maxPrice" :presets="pricePresets" :aria-label="t('filter.price')" />
            </div>
            <div class="filter-field grow">
                <span class="filter-label">{{ t('filter.sort') }}</span>
                <SkySelect v-model="filters.sort" :options="sortOptions" :aria-label="t('filter.sort')" />
            </div>
            <form class="filter-field search-field-group" role="search" @submit.prevent="searchProducts">
                <span class="filter-label">{{ t('filter.keyword') }}</span>
                <div class="search-row">
                    <label class="search-field">
                        <SkyIcon name="search" class="search-icon" />
                        <input v-model="stext" type="search" :placeholder="t('shop.placeholder')" :aria-label="t('shop.searchLabel')">
                    </label>
                    <button class="sk-btn" type="submit">{{ t('shop.search') }}</button>
                </div>
            </form>
            <button class="sk-btn sk-btn-ghost" type="button" :disabled="!filterActive" @click="resetFilters">{{ t('filter.reset') }}</button>
        </div>

        <p v-if="!loading && !error" class="result-count" aria-live="polite">
            <template v-if="searched">{{ t('shop.resultsFor', { q: searched }) }}</template>
            {{ t('shop.found') }} <strong class="sk-mono">{{ shown.length }}</strong> {{ t('shop.items') }}
            <span v-if="shown.length !== product.length">({{ t('filter.showing', { n: shown.length, total: product.length }) }})</span>
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
        <div v-else-if="shown.length" class="product-grid">
            <ProductCard v-for="pd in shown" :key="pd.pdId" :product="pd" />
        </div>
        <div v-else-if="product.length" class="sk-empty">
            <span class="sk-empty-icon"><SkyIcon name="search" :size="32" /></span>
            <h2>{{ t('filter.none') }}</h2>
            <p>{{ t('filter.noneText') }}</p>
            <button class="sk-btn" type="button" @click="resetFilters">{{ t('filter.reset') }}</button>
        </div>
        <div v-else class="sk-empty">
            <span class="sk-empty-icon"><SkyIcon name="search" :size="32" /></span>
            <h2>{{ t('shop.noMatch', { q: searched }) }}</h2>
            <p>{{ t('shop.noMatchText') }}</p>
            <button class="sk-btn" type="button" @click="clearSearch">{{ t('shop.showAll') }}</button>
        </div>
    </div>

</template>

<script setup>
    import { computed, onMounted, reactive, ref } from 'vue';
    import axios from 'axios';
    import { useCartStore } from '../stores/cartStore.js';
    import { t } from '../i18n.js';
    import ProductCard from '../components/ui/ProductCard.vue';
    import SkyIcon from '../components/ui/SkyIcon.vue';
    import SkySelect from '../components/ui/SkySelect.vue';
    import SkyRange from '../components/ui/SkyRange.vue';

    const product = ref([])
    const stext = ref('')
    const searched = ref('')
    const loading = ref(true)
    const error = ref(false)
    const cartStore = useCartStore()
    const addProduct = async (pd) => {
        try {
            await cartStore.addProduct(pd)
        } catch (err) {
            console.log(err.message)
        }
    }

    const emptyFilters = () => ({ brandId: '', pdTypeId: '', minPrice: '', maxPrice: '', sort: 'id' })
    const filters = reactive(emptyFilters())
    const resetFilters = () => Object.assign(filters, emptyFilters())
    const filterActive = computed(() => Object.entries(emptyFilters()).some(([key, value]) => filters[key] !== value))
    const pricePresets = [{ max: 100 }, { min: 100, max: 500 }, { min: 500, max: 1000 }, { min: 1000, max: 5000 }, { min: 5000 }]

    // options come from the rows we already have, so no extra request
    const optionsFrom = (objectKey, idKey, nameKey) => {
        const found = new Map()
        for (const pd of product.value) {
            const id = pd[objectKey]?.[idKey] ?? pd[idKey]
            if (id && !found.has(id)) found.set(id, pd[objectKey]?.[nameKey] || id)
        }
        const list = [...found].map(([value, label]) => ({ value, label })).sort((a, b) => String(a.label).localeCompare(String(b.label)))
        return [{ value: '', label: t('filter.all') }, ...list]
    }
    const brandOptions = computed(() => optionsFrom('brand', 'brandId', 'brandName'))
    const typeOptions = computed(() => optionsFrom('pdt', 'pdTypeId', 'pdTypeName'))
    const sortOptions = computed(() => [
        { value: 'id', label: t('filter.sortId') },
        { value: 'nameAsc', label: t('filter.sortNameAsc') },
        { value: 'nameDesc', label: t('filter.sortNameDesc') },
        { value: 'priceAsc', label: t('filter.sortPriceAsc') },
        { value: 'priceDesc', label: t('filter.sortPriceDesc') }
    ])

    const limit = (value) => value === '' || value === null ? null : (Number.isFinite(Number(value)) ? Number(value) : null)
    const sorters = {
        id: (a, b) => String(a.pdId).localeCompare(String(b.pdId), undefined, { numeric: true }),
        nameAsc: (a, b) => String(a.pdName).localeCompare(String(b.pdName)),
        nameDesc: (a, b) => String(b.pdName).localeCompare(String(a.pdName)),
        priceAsc: (a, b) => Number(a.pdPrice) - Number(b.pdPrice),
        priceDesc: (a, b) => Number(b.pdPrice) - Number(a.pdPrice)
    }
    const shown = computed(() => {
        const min = limit(filters.minPrice)
        const max = limit(filters.maxPrice)
        const rows = product.value.filter((pd) => {
            if (filters.brandId && (pd.brand?.brandId ?? pd.brandId) !== filters.brandId) return false
            if (filters.pdTypeId && (pd.pdt?.pdTypeId ?? pd.pdTypeId) !== filters.pdTypeId) return false
            const price = Number(pd.pdPrice)
            if (min !== null && price < min) return false
            if (max !== null && price > max) return false
            return true
        })
        return rows.sort(sorters[filters.sort] || sorters.id)
    })

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
.shop-head { margin-bottom: 24px; }
.shop-head .sk-head { margin-bottom: 0; }
.sk-filters .search-field-group { flex: 2.2 1 0; min-width: 240px; }
.search-row { display: flex; align-items: center; gap: 10px; }
.search-field {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    height: 44px;
    margin: 0;
    padding: 0 12px 0 38px;
    background: var(--surface);
    border: 1px solid var(--outline-strong);
    border-radius: 12px;
    box-sizing: border-box;
}
.search-field:focus-within { border-color: var(--sky-deep); box-shadow: 0 0 0 3px var(--sky-soft); }
.search-icon {
    position: absolute;
    top: 50%;
    left: 12px;
    width: 16px;
    height: 16px;
    color: var(--ink-subtle);
    transform: translateY(-50%);
    pointer-events: none;
}
.search-field input {
    display: block;
    width: 100%;
    height: 42px;
    min-height: 0;
    margin: 0;
    padding: 0;
    color: var(--ink);
    background: transparent;
    border: 0;
    outline: 0;
    font-family: var(--font-body);
    font-size: 16px;
}
.search-field input::placeholder { color: var(--ink-subtle); }
.search-field input:focus, .search-field input:focus-visible { outline: none !important; box-shadow: none; }
.search-row .sk-btn {
    flex: none;
    min-width: 88px;
    min-height: 44px;
    height: 44px;
    padding: 0 16px;
    color: #fff;
    background: var(--sky);
    border: 0;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
}
.search-row .sk-btn:hover, .search-row .sk-btn:focus-visible { color: #fff; background: var(--sky-deep); }
.result-count { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin: 0 0 24px; color: var(--ink-muted); }
.result-count strong { color: var(--ink); }
.clear-search { min-height: 44px; padding: 0 12px; color: var(--sky-deep); background: none; border: 0; border-radius: 12px; cursor: pointer; font-weight: 700; text-decoration: underline; }
.clear-search:hover { background: var(--sky-soft); }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 32px; }
.skeleton-card { height: 440px; border-radius: var(--r-card); }

@media (max-width: 640px) {
    .sk-filters .search-field-group { flex: 1 1 100%; }
    .search-row { flex-direction: column; align-items: stretch; }
    .search-row .sk-btn { width: 100%; }
    .product-grid { gap: 20px; }
}
</style>
