<template>
    <div v-if="isSky" class="sk-page">
        <section class="hero sk-panel">
            <div class="hero-text">
                <p class="sk-kicker">{{ t('store.name') }}</p>
                <h1>{{ t('home.titleA') }}<br>{{ t('home.titleB') }} <span>KU</span></h1>
                <p class="hero-lead">{{ t('home.lead') }}</p>
                <div class="hero-actions">
                    <router-link to="/product" class="sk-btn sk-btn-big">
                        {{ t('home.browse') }} <SkyIcon name="arrow" />
                    </router-link>
                    <router-link :to="cartStore.cartId ? `/cartshow/${cartStore.cartId}` : '/cartlist'" class="sk-btn sk-btn-big sk-btn-ghost">
                        <SkyIcon name="cart" /> {{ t('home.cart', { n: cartStore.theQty }) }}
                    </router-link>
                </div>
            </div>
            <ul class="hero-points">
                <li v-for="point in points" :key="point.title" class="sk-card">
                    <span class="point-icon" :class="point.tone"><SkyIcon :name="point.icon" :size="28" /></span>
                    <div><strong>{{ t(point.title) }}</strong><small>{{ t(point.text) }}</small></div>
                </li>
            </ul>
        </section>

        <section class="featured">
            <div class="featured-head">
                <div>
                    <p class="sk-kicker">{{ t('home.featuredKicker') }}</p>
                    <h2>{{ t('home.featured') }}</h2>
                </div>
                <router-link to="/product" class="see-all">{{ t('home.seeAll') }} <SkyIcon name="arrow" :size="20" /></router-link>
            </div>

            <div v-if="loading" class="product-grid" aria-busy="true">
                <div v-for="n in 3" :key="n" class="skeleton-card sk-skeleton"></div>
            </div>
            <div v-else-if="error" class="sk-empty">
                <span class="sk-empty-icon"><SkyIcon name="refresh" :size="32" /></span>
                <h2>{{ t('common.loadFail') }}</h2>
                <p>{{ t('common.loadFailText') }}</p>
                <button class="sk-btn" type="button" @click="loadProducts"><SkyIcon name="refresh" /> {{ t('common.retry') }}</button>
            </div>
            <div v-else-if="product.length" class="product-grid">
                <ProductCard v-for="pd in product" :key="pd.pdId" :product="pd" />
            </div>
            <div v-else class="sk-empty">
                <span class="sk-empty-icon"><SkyIcon name="shop" :size="32" /></span>
                <h2>{{ t('home.empty') }}</h2>
                <p>{{ t('home.emptyText') }}</p>
                <router-link to="/product" class="sk-btn">{{ t('home.goProducts') }}</router-link>
            </div>
        </section>
    </div>

    <template v-else>
        <h1>{{ t('home.classicWelcome') }}</h1>
        <div class="row">
            <div v-for="(pd,pdId) in product" :key="pdId" class="col-lg-4 col-md-6 col-sm-12">
                <div class="card mt-3" style="width: 18rem; background-color: #EEEEEE; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <img :src="pd.logosrc ? `http://localhost:3000${pd.logosrc}` : `http://localhost:3000/products/${pd.pdId}/image`" class="card-img-top p-2" :alt="t('product.imgAlt')">
                    <div class="card-body">
                        <h5 class="card-title">{{ pd.pdName }}</h5>
                        <p class="card-text">{{ pd.brand?.brandName || t('product.noBrand') }} - ${{ pd.pdPrice }}</p>
                        <router-link :to="{ name: 'ProductShow', params: { pdId: pd.pdId } }" class="btn btn-outline-primary me-2">
                            <i class="bi bi-search"></i> {{ t('product.detail') }}
                        </router-link>
                        <button class="btn btn-primary" type="button" @click="addProduct(pd)">
                            <i class="bi bi-cart"></i> {{ t('product.add') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </template>
</template>

<script setup>
    import { onMounted, ref } from 'vue';
    import axios from 'axios';
    import { useCartStore } from '../stores/cartStore.js';
    import { useAuthStore } from '../stores/authStore.js';
    import { isSky } from '../stores/theme.js';
    import { t } from '../i18n.js';
    import ProductCard from './ProductCard.vue';
    import SkyIcon from './SkyIcon.vue';

    const product = ref([])
    const loading = ref(true)
    const error = ref(false)
    const cartStore = useCartStore()
    const authStore = useAuthStore()
    const addProduct = async (pd) => {
        if (!authStore.isLogin) return window.alert(t('product.loginFirst'))
        try {
            await cartStore.addProduct(pd)
        } catch (err) {
            console.log(err.message)
            window.alert(t('product.addFail'))
        }
    }

    const points = [
        { icon: 'truck', title: 'home.p1', text: 'home.p1Text', tone: 'leaf' },
        { icon: 'search', title: 'home.p2', text: 'home.p2Text', tone: 'sky' },
        { icon: 'cart', title: 'home.p3', text: 'home.p3Text', tone: 'berry' }
    ]

    const loadProducts = async () => {
        loading.value = true
        error.value = false
        try {
            const res = await axios.get('http://localhost:3000/products/three')
            product.value = res.data
        } catch (err) {
            console.log(err)
            error.value = true
        } finally {
            loading.value = false
        }
    }

    onMounted(loadProducts)
</script>

<style scoped>
.hero {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
    gap: 48px;
    align-items: center;
    padding: clamp(32px, 5vw, 64px);
    background:
        radial-gradient(circle at 100% 0, var(--sky-soft) 0, transparent 45%),
        var(--surface);
}
.hero h1 { margin: 0 0 16px; font-size: clamp(40px, 6vw, 56px); line-height: 1.12; }
.hero h1 span { color: var(--sky); }
.hero-lead { max-width: 480px; margin: 0 0 32px; color: var(--ink-muted); font-size: 20px; line-height: 1.6; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 16px; }
.hero-points { display: grid; gap: 16px; margin: 0; padding: 0; list-style: none; }
.hero-points li { display: flex; align-items: center; gap: 16px; padding: 16px 20px; }
.hero-points strong { display: block; font-size: 18px; }
.hero-points small { display: block; color: var(--ink-muted); font-size: 16px; }
.point-icon { display: grid; flex: none; place-items: center; width: 56px; height: 56px; border-radius: 16px; }
.point-icon.sky { color: var(--sky-deep); background: var(--sky-soft); }
.point-icon.leaf { color: var(--leaf-ink); background: var(--leaf-soft); }
.point-icon.berry { color: #7e22ce; background: #f3e8ff; }

.featured { margin-top: 64px; }
.featured-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.featured-head h2 { margin: 0; font-size: 32px; }
.see-all { display: inline-flex; align-items: center; gap: 8px; min-height: 56px; font-weight: 700; text-decoration: none; }
.see-all:hover { text-decoration: underline; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; }
.skeleton-card { height: 440px; border-radius: var(--r-card); }

@media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 32px; }
}
@media (max-width: 640px) {
    .hero { padding: 28px 20px; border-radius: var(--r-card); }
    .hero h1 { font-size: 36px; }
    .hero-lead { font-size: 18px; }
    .hero-actions .sk-btn { width: 100%; padding: 14px 20px; }
    .hero-points li { gap: 12px; padding: 14px; }
    .point-icon { width: 48px; height: 48px; }
    .product-grid { gap: 20px; }
}
</style>
