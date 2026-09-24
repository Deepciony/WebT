<template>
    <section class="orders-page sk-page">
        <header class="orders-head sk-head">
            <p class="orders-kicker sk-kicker">{{ t('orders.kicker') }}</p>
            <h1>{{ t('orders.title') }}</h1>
            <p>{{ t('orders.lead') }}</p>
        </header>

        <p v-if="loading" class="orders-state" aria-busy="true">{{ t('db.loading') }}</p>

        <div v-else-if="!authStore.isLogin && cartStore.guestItems.length" class="guest-cart-layout">
            <div class="guest-cart-items">
                <article v-for="item in cartStore.guestItems" :key="item.pdId" class="guest-cart-item sk-card">
                    <img :src="item.logosrc ? `http://localhost:3000${item.logosrc}` : `http://localhost:3000/products/${item.pdId}/image`" :alt="t('product.imgAlt')">
                    <div class="guest-cart-item-info">
                        <small class="sk-mono">#{{ item.pdId }}</small>
                        <h2>{{ item.pdName }}</h2>
                        <p class="sk-mono">${{ Number(item.price).toFixed(2) }}</p>
                    </div>
                    <div class="guest-quantity-control">
                        <button type="button" :disabled="item.qty <= 1" @click="cartStore.adjustGuestQty(item.pdId, item.qty - 1)">−</button>
                        <span class="sk-mono">{{ item.qty }}</span>
                        <button type="button" @click="cartStore.adjustGuestQty(item.pdId, item.qty + 1)">+</button>
                    </div>
                    <strong class="sk-mono">${{ (Number(item.price) * Number(item.qty)).toFixed(2) }}</strong>
                    <button class="guest-remove" type="button" :aria-label="`${t('cart.remove')} ${item.pdName}`" @click="cartStore.removeGuestProduct(item.pdId)">×</button>
                </article>
            </div>

            <aside class="guest-checkout sk-panel">
                <p class="orders-kicker sk-kicker">{{ t('cartdb.guestTitle') }}</p>
                <h2>{{ t('cart.summary') }}</h2>
                <div class="guest-summary-line"><span>{{ t('cart.itemsLine', { n: guestQty }) }}</span><strong class="sk-mono">${{ guestTotal.toFixed(2) }}</strong></div>
                <div class="guest-summary-line"><span>{{ t('cart.shipping') }}</span><strong class="free">{{ t('cart.free') }}</strong></div>
                <div class="guest-summary-total"><span>{{ t('cart.total') }}</span><strong class="sk-mono">${{ guestTotal.toFixed(2) }}</strong></div>
                <button class="sk-btn sk-btn-block" type="button" @click="openLoginNotice">{{ t('cartdb.guestPlace') }} <span>→</span></button>
            </aside>
        </div>

        <div v-else-if="carts.length" class="orders-table sk-card">
            <table>
                <thead>
                    <tr>
                        <th>{{ t('orders.no') }}</th>
                        <th>{{ t('orders.cartId') }}</th>
                        <th>{{ t('orders.date') }}</th>
                        <th class="align-center">{{ t('cartdb.qty') }}</th>
                        <th class="align-right">{{ t('cartdb.amount') }}</th>
                        <th class="align-center">{{ t('orders.status') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="cart in carts" :key="cart.cartId">
                        <td class="sk-mono">{{ cart.row_number }}</td>
                        <td>
                            <router-link :to="`/cartshow/${cart.cartId}`" class="sk-mono order-link">{{ cart.cartId }}</router-link>
                        </td>
                        <td>{{ formattedDate(cart.cartDate) }}</td>
                        <td class="align-center sk-mono">{{ cart.sqty ?? 0 }}</td>
                        <td class="align-right sk-mono">${{ Number(cart.sprice ?? 0).toFixed(2) }}</td>
                        <td class="align-center">
                            <span v-if="isSky" class="status" :class="cart.cartCf ? 'done' : 'open'">
                                {{ cart.cartCf ? t('cartdb.confirmed') : t('cartdb.open') }}
                            </span>
                            <i v-else class="bi" :class="cart.cartCf ? 'bi-check-lg text-success' : 'bi-dash'"
                                :title="cart.cartCf ? t('cartdb.confirmed') : t('cartdb.open')"></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="sk-empty">
            <span class="sk-empty-icon">○</span>
            <h2>{{ t('orders.empty') }}</h2>
            <p>{{ t('orders.emptyText') }}</p>
            <router-link to="/product" class="sk-btn">{{ t('cart.browse') }}</router-link>
        </div>

        <div v-if="loginNotice" class="notice-overlay" @click.self="loginNotice = false">
            <div class="notice-dialog" role="dialog" aria-modal="true" aria-labelledby="login-notice-title">
                <h2 id="login-notice-title">{{ t('cartdb.loginRequiredTitle') }}</h2>
                <p>{{ t('cartdb.loginRequiredText') }}</p>
                <div class="notice-actions">
                    <button class="sk-btn sk-btn-ghost" type="button" @click="loginNotice = false">{{ t('common.close') }}</button>
                    <router-link class="sk-btn" to="/login?redirect=/cartlist">{{ t('cartdb.login') }}</router-link>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { t } from '../i18n.js'
import { isSky } from '../stores/theme.js'
import { useAuthStore } from '../stores/authStore.js'
import { useCartStore } from '../stores/cartStore.js'

const carts = ref([])
const loading = ref(true)
const loginNotice = ref(false)
const authStore = useAuthStore()
const cartStore = useCartStore()
const guestQty = computed(() => cartStore.guestItems.reduce((sum, item) => sum + Number(item.qty), 0))
const guestTotal = computed(() => cartStore.guestItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0))

const openLoginNotice = () => {
    loginNotice.value = true
}

const formattedDate = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

onMounted(async () => {
    try {
        await cartStore.refresh()
        if (!authStore.isLogin) return
        // POST so the member comes from the token cookie, not the URL
        const res = await axios.post('http://localhost:3000/carts/getcartbycus', {})
        carts.value = Array.isArray(res.data) ? res.data : []
    } catch (err) {
        console.log(err.message)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.orders-page { max-width: 1100px; margin: 0 auto; padding: 42px 24px 70px; }
.orders-kicker { margin: 0 0 8px; color: #198754; font-size: 11px; font-weight: 700; letter-spacing: .16em; }
.orders-head h1 { margin: 0 0 6px; color: #2c3e50; font-size: 34px; }
.orders-head p { margin: 0; color: #71808a; }
.orders-state { padding: 40px 0; color: #71808a; text-align: center; }
.orders-table { overflow-x: auto; margin-top: 24px; background: #fff; border: 1px solid #dce5df; border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { padding: 12px 16px; border-bottom: 1px solid #edf0ef; text-align: left; white-space: nowrap; }
th { color: #53636d; background: #f7f9f8; font-size: 12px; }
tbody tr:last-child td { border-bottom: 0; }
.align-center { text-align: center; }
.align-right { text-align: right; }
.order-link { color: #198754; font-weight: 700; text-decoration: none; }
.order-link:hover { text-decoration: underline; }
.status { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.status.done { color: #15803d; background: #dcfce7; }
.status.open { color: #92400e; background: #fef3c7; }
.guest-cart-layout { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(320px, .8fr); gap: 26px; align-items: start; margin-top: 28px; }
.guest-cart-item { display: grid; grid-template-columns: 92px minmax(0, 1fr) auto auto 28px; gap: 16px; align-items: center; margin-bottom: 12px; padding: 14px; background: #fff; border: 1px solid #dce5df; border-radius: 10px; box-shadow: 0 5px 16px rgba(44, 62, 80, .06); }
.guest-cart-item img { width: 92px; height: 92px; object-fit: contain; background: #f4f7f5; border-radius: 7px; }
.guest-cart-item-info { min-width: 0; }
.guest-cart-item-info small { color: var(--sky-deep); font-size: 11px; font-weight: 700; }
.guest-cart-item-info h2 { overflow: hidden; margin: 4px 0; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
.guest-cart-item-info p { margin: 0; color: var(--ink-muted); }
.guest-quantity-control { display: flex; align-items: center; gap: 9px; padding: 4px; border: 1px solid var(--outline); border-radius: 6px; }
.guest-quantity-control button { width: 25px; height: 25px; border: 0; background: var(--sunken); cursor: pointer; }
.guest-quantity-control button:disabled { opacity: .45; cursor: not-allowed; }
.guest-quantity-control span { min-width: 18px; text-align: center; }
.guest-remove { width: 28px; height: 28px; color: var(--coral-ink); background: transparent; border: 0; border-radius: 6px; cursor: pointer; font-size: 22px; line-height: 1; }
.guest-remove:hover { background: var(--coral-soft); }
.guest-checkout { padding: 25px; background: #fff; border: 1px solid #dce5df; border-radius: 10px; box-shadow: 0 8px 24px rgba(44, 62, 80, .08); }
.guest-checkout h2 { margin: 0 0 18px; color: var(--ink); font-size: 24px; }
.guest-summary-line, .guest-summary-total { display: flex; justify-content: space-between; padding: 9px 0; color: var(--ink-muted); }
.guest-summary-total { margin: 8px 0 18px; padding-top: 15px; color: var(--ink); border-top: 1px solid var(--outline); font-size: 19px; }
.guest-checkout .sk-btn span { float: right; font-size: 19px; }
.notice-overlay { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; background: rgba(15, 23, 42, .5); }
.notice-dialog { width: min(420px, calc(100vw - 32px)); padding: 24px; color: var(--ink); background: var(--surface); border: 1px solid var(--outline); border-radius: var(--r-card); box-shadow: var(--shadow-active); }
.notice-dialog h2 { margin: 0 0 8px; font-size: 24px; }
.notice-dialog p { margin: 0 0 22px; color: var(--ink-muted); }
.notice-actions { display: flex; justify-content: flex-end; gap: 10px; }
.notice-actions .sk-btn { text-decoration: none; }

/* Skylearn */
:root[data-theme="sky"] .orders-head h1 { color: var(--ink); font-size: clamp(30px, 4vw, 40px); }
:root[data-theme="sky"] .orders-head p { color: var(--ink-muted); font-size: 18px; }
:root[data-theme="sky"] .guest-cart-layout { grid-template-columns: minmax(0, 1.45fr) minmax(340px, .85fr); gap: 32px; }
:root[data-theme="sky"] .guest-cart-item { grid-template-columns: 112px minmax(0, 1fr) auto auto 56px; gap: 20px; margin-bottom: 16px; padding: 16px; border-radius: 18px; box-shadow: 0 8px 22px rgba(15, 23, 42, .06); }
:root[data-theme="sky"] .guest-cart-item img { width: 112px; height: 112px; padding: 8px; background: var(--sunken); border-radius: 14px; }
:root[data-theme="sky"] .guest-cart-item-info small { color: var(--sky-deep); font-size: 14px; }
:root[data-theme="sky"] .guest-cart-item-info h2 { margin: 4px 0; font-size: 20px; }
:root[data-theme="sky"] .guest-cart-item-info p { color: var(--ink-muted); font-size: 16px; }
:root[data-theme="sky"] .guest-cart-item > strong { font-size: 20px; }
:root[data-theme="sky"] .guest-quantity-control { gap: 4px; padding: 4px; background: var(--sunken); border: 0; border-radius: 16px; }
:root[data-theme="sky"] .guest-quantity-control button { width: 48px; height: 48px; color: var(--sky-deep); background: var(--surface); border: 1px solid var(--outline); border-radius: 12px; font-size: 22px; font-weight: 700; }
:root[data-theme="sky"] .guest-quantity-control button:hover:not(:disabled) { color: #fff; background: var(--sky); border-color: var(--sky); }
:root[data-theme="sky"] .guest-quantity-control button:disabled { color: var(--ink-faint); cursor: not-allowed; }
:root[data-theme="sky"] .guest-quantity-control span { min-width: 32px; font-size: 18px; font-weight: 700; }
:root[data-theme="sky"] .guest-remove { width: 56px; height: 56px; border-radius: 16px; font-size: 28px; }
:root[data-theme="sky"] .guest-checkout { position: sticky; top: 120px; padding: 32px; border-radius: 22px; box-shadow: 0 12px 28px rgba(15, 23, 42, .08); }
:root[data-theme="sky"] .guest-checkout h2 { margin: 0 0 20px; font-size: 28px; }
:root[data-theme="sky"] .guest-summary-line { padding: 10px 0; color: var(--ink-muted); }
:root[data-theme="sky"] .guest-summary-line .free { color: var(--leaf-ink); }
:root[data-theme="sky"] .guest-summary-total { margin: 8px 0 24px; padding-top: 16px; color: var(--ink); border-color: var(--outline); font-size: 22px; font-weight: 700; }
:root[data-theme="sky"] .guest-summary-total strong { color: var(--sky-deep); font-size: 28px; }
:root[data-theme="sky"] .guest-checkout > .sk-btn { background: var(--sky); border-color: var(--sky-deep); }
:root[data-theme="sky"] .guest-checkout > .sk-btn:hover, :root[data-theme="sky"] .guest-checkout > .sk-btn:focus-visible { color: #fff; background: var(--sky-deep); }
:root[data-theme="sky"] .orders-table { margin-top: 28px; border-color: var(--outline); border-radius: var(--r-card); }
:root[data-theme="sky"] table { font-size: 16px; }
:root[data-theme="sky"] th, :root[data-theme="sky"] td { padding: 16px 20px; border-color: var(--outline); }
:root[data-theme="sky"] th { color: var(--ink-muted); background: var(--sunken); font-size: 14px; }
:root[data-theme="sky"] tbody tr:hover { background: var(--bg); }
:root[data-theme="sky"] .order-link { color: var(--sky-deep); }
:root[data-theme="sky"] .status { padding: 6px 14px; font-size: 14px; }
@media (max-width: 640px) {
    .orders-page { padding: 26px 14px 50px; }
    .guest-cart-layout { grid-template-columns: 1fr; }
    .guest-cart-item { grid-template-columns: 64px minmax(0, 1fr) 28px; gap: 10px; }
    .guest-cart-item img { width: 64px; height: 64px; }
    .guest-quantity-control { grid-column: 2; grid-row: 2; justify-self: start; }
    .guest-cart-item > strong { grid-column: 2; grid-row: 2; justify-self: end; }
    .guest-cart-item > .guest-remove { grid-column: 3; grid-row: 1; }
}
</style>
