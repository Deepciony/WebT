<template>
    <section class="cart-page sk-page">
        <SkyConfetti v-if="celebrate" />

        <p v-if="loading" class="cart-state" aria-busy="true">{{ t('db.loading') }}</p>

        <div v-else-if="!cart" class="cart-state sk-empty">
            <h2>{{ t('cartdb.noAccess') }}</h2>
            <router-link to="/cartlist" class="sk-btn">{{ t('cartdb.viewOrders') }}</router-link>
        </div>

        <template v-else>
            <header class="cart-header sk-head">
                <div>
                    <p class="page-kicker sk-kicker">{{ t('cartdb.kicker') }}</p>
                    <h1>{{ t('cartdb.title', { id: cart.cartId }) }}</h1>
                    <p>{{ t('cartdb.date', { date: formattedDate(cart.cartDate) }) }}</p>
                </div>
                <span class="cart-count sk-pill">{{ cart.cartCf ? t('cartdb.confirmed') : t('cartdb.open') }}</span>
            </header>

            <p v-if="message" class="sk-msg" :class="{ error: !done }" role="status">{{ t(message) }}</p>

            <div v-if="items.length" class="cart-layout">
                <div class="cart-items">
                    <article v-for="item in items" :key="item.pdId" class="cart-item sk-card">
                        <img :src="`http://localhost:3000/products/${item.pdId}/image`" :alt="t('product.imgAlt')">
                        <div class="cart-item-info">
                            <small class="sk-mono">#{{ item.pdId }}</small>
                            <h2>{{ item.pdName }}</h2>
                            <p class="sk-mono">${{ Number(item.price).toFixed(2) }}</p>
                        </div>
                        <div v-if="!cart.cartCf" class="quantity-control">
                            <button type="button" :disabled="item.qty <= 1 || busy" :aria-label="t('cart.decrease', { name: item.pdName })" @click="setQty(item, item.qty - 1)">−</button>
                            <span class="sk-mono">{{ item.qty }}</span>
                            <button type="button" :disabled="busy" :aria-label="t('cart.increase', { name: item.pdName })" @click="setQty(item, item.qty + 1)">+</button>
                        </div>
                        <span v-else class="sk-mono cart-qty-fixed">×{{ item.qty }}</span>
                        <strong class="sk-mono">${{ (Number(item.price) * Number(item.qty)).toFixed(2) }}</strong>
                        <button v-if="!cart.cartCf" class="remove-item" type="button" :disabled="busy" :aria-label="t('cart.remove', { name: item.pdName })" @click="removeItem(item)">×</button>
                    </article>
                </div>

                <aside class="checkout-card sk-panel">
                    <p class="page-kicker sk-kicker">{{ t('cart.checkoutKicker') }}</p>
                    <h2>{{ t('cart.summary') }}</h2>
                    <div class="summary-line"><span>{{ t('cart.itemsLine', { n: totalQty }) }}</span><strong class="sk-mono">${{ totalMoney.toFixed(2) }}</strong></div>
                    <div class="summary-line"><span>{{ t('cart.shipping') }}</span><strong class="free">{{ t('cart.free') }}</strong></div>
                    <div class="summary-total"><span>{{ t('cart.total') }}</span><strong class="sk-mono">${{ totalMoney.toFixed(2) }}</strong></div>

                    <template v-if="!cart.cartCf">
                        <button class="checkout-button sk-btn sk-btn-big sk-btn-block sk-btn-leaf" type="button" :disabled="busy" @click="confirmOrder">
                            {{ t('cartdb.confirm') }} <span>→</span>
                        </button>
                        <button class="delete-cart sk-btn sk-btn-block sk-btn-coral" type="button" :disabled="busy" @click="removeCart">
                            {{ t('cartdb.delete') }}
                        </button>
                    </template>
                    <router-link to="/cartlist" class="sk-btn sk-btn-block sk-btn-ghost">{{ t('cartdb.viewOrders') }}</router-link>
                </aside>
            </div>

            <div v-else class="empty-cart sk-empty">
                <span class="sk-empty-icon">○</span>
                <h2>{{ t('cartdb.emptyCart') }}</h2>
                <p>{{ t('cart.emptyText') }}</p>
                <router-link to="/product" class="sk-btn">{{ t('cart.browse') }}</router-link>
            </div>
        </template>
    </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '../stores/cartStore.js'
import { isSky } from '../stores/theme.js'
import { t } from '../i18n.js'
import SkyConfetti from './SkyConfetti.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const cart = ref(null)
const items = ref([])
const loading = ref(true)
const busy = ref(false)
const done = ref(false)
const message = ref('')
const celebrate = ref(false)

const totalQty = computed(() => items.value.reduce((sum, item) => sum + Number(item.qty), 0))
const totalMoney = computed(() => items.value.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0))

const formattedDate = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

const load = async () => {
    loading.value = true
    try {
        const id = route.params.cartId
        // The API only answers with carts that belong to the signed-in member
        const [master, detail] = await Promise.all([
            axios.get(`http://localhost:3000/carts/getcart/${id}`),
            axios.get(`http://localhost:3000/carts/getcartdtl/${id}`)
        ])
        cart.value = Array.isArray(master.data) ? master.data[0] || null : null
        items.value = Array.isArray(detail.data) ? detail.data : []
    } catch (err) {
        console.log(err.message)
        cart.value = null
    } finally {
        loading.value = false
    }
}

const run = async (action) => {
    busy.value = true
    message.value = ''
    try {
        await action()
        return true
    } catch (err) {
        console.log(err.message)
        done.value = false
        message.value = 'cartdb.actionFail'
        return false
    } finally {
        busy.value = false
    }
}

const setQty = (item, qty) => run(async () => {
    await cartStore.setQty(cart.value.cartId, item.pdId, qty)
    await load()
})

const removeItem = (item) => run(async () => {
    await cartStore.removeProduct(cart.value.cartId, item.pdId)
    await load()
})

const removeCart = async () => {
    if (!window.confirm(t('cartdb.confirmDelete'))) return
    const ok = await run(() => cartStore.deleteCart(cart.value.cartId))
    if (ok) router.push('/cartlist')
}

const confirmOrder = async () => {
    if (!window.confirm(t('cartdb.confirmOrder'))) return
    const ok = await run(() => cartStore.confirmCart(cart.value.cartId))
    if (!ok) return
    done.value = true
    message.value = 'cartdb.done'
    celebrate.value = isSky.value
    await load()
}

watch(() => route.params.cartId, load)
onMounted(load)
</script>

<style scoped>
.cart-page { max-width: 1180px; margin: 0 auto; padding: 42px 24px 70px; color: #243746; }
.cart-state { padding: 48px 0; text-align: center; }
.cart-header { display: flex; align-items: end; justify-content: space-between; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #dce5df; }
.page-kicker { margin: 0 0 8px; color: #198754; font-size: 11px; font-weight: 700; letter-spacing: .16em; }
.cart-header h1 { margin: 0 0 5px; font-size: 34px; }
.cart-header p { margin: 0; color: #71808a; }
.cart-count { color: #198754; font-weight: 700; }
.cart-layout { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(320px, .8fr); gap: 26px; align-items: start; }
.cart-items { min-width: 0; }
.cart-item { display: grid; grid-template-columns: 92px minmax(0, 1fr) auto auto 28px; gap: 16px; align-items: center; margin-bottom: 12px; padding: 14px; background: #fff; border: 1px solid #dce5df; border-radius: 10px; box-shadow: 0 5px 16px rgba(44, 62, 80, .06); }
.cart-item img { width: 92px; height: 92px; object-fit: contain; background: #f4f7f5; border-radius: 7px; }
.cart-item-info { min-width: 0; }
.cart-item-info small { color: #198754; font-size: 11px; font-weight: 700; }
.cart-item-info h2 { overflow: hidden; margin: 4px 0; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
.cart-item-info p { margin: 0; color: #71808a; }
.quantity-control { display: flex; align-items: center; gap: 9px; padding: 4px; border: 1px solid #d2ddd6; border-radius: 6px; }
.quantity-control button { width: 25px; height: 25px; border: 0; background: #f1f5f2; cursor: pointer; }
.quantity-control span { min-width: 18px; text-align: center; }
.cart-qty-fixed { color: #71808a; }
.remove-item { color: #c0392b; background: transparent; border: 0; cursor: pointer; font-size: 22px; }
.checkout-card { padding: 25px; background: #fff; border: 1px solid #dce5df; border-radius: 10px; box-shadow: 0 8px 24px rgba(44, 62, 80, .08); }
.checkout-card h2 { margin: 0 0 18px; font-size: 24px; }
.summary-line, .summary-total { display: flex; justify-content: space-between; padding: 9px 0; color: #71808a; }
.summary-total { margin: 8px 0 18px; padding-top: 15px; color: #243746; border-top: 1px solid #dce5df; font-size: 19px; }
.checkout-button { width: 100%; padding: 13px; color: #fff; background: #198754; border: 0; border-radius: 5px; cursor: pointer; font-weight: 700; }
.checkout-button span { float: right; font-size: 19px; }
.delete-cart, .checkout-card a { display: block; width: 100%; margin-top: 10px; padding: 11px; border-radius: 5px; cursor: pointer; font-weight: 700; text-align: center; text-decoration: none; }
.delete-cart { color: #c0392b; background: #fff; border: 1px solid #e2b8b2; }
.checkout-card a { color: #52606d; background: #edf0f2; border: 0; }
.empty-cart { padding: 80px 20px; text-align: center; }
.empty-cart span { color: #f0c75e; font-size: 52px; }
.empty-cart h2 { margin: 10px 0 6px; font-size: 25px; }
.empty-cart p { margin: 0 0 16px; color: #71808a; }

/* Skylearn */
:root[data-theme="sky"] .cart-page { color: var(--ink); }
:root[data-theme="sky"] .cart-header { align-items: flex-end; }
:root[data-theme="sky"] .cart-count { padding: 8px 16px; font-size: 16px; }
:root[data-theme="sky"] .cart-layout { grid-template-columns: minmax(0, 1.45fr) minmax(340px, .85fr); gap: 32px; }
:root[data-theme="sky"] .cart-item { grid-template-columns: 112px minmax(0, 1fr) auto auto 56px; gap: 20px; margin-bottom: 16px; padding: 16px; }
:root[data-theme="sky"] .cart-item img { width: 112px; height: 112px; padding: 8px; background: var(--sunken); border-radius: 14px; }
:root[data-theme="sky"] .cart-item-info small { color: var(--sky-deep); font-size: 14px; }
:root[data-theme="sky"] .cart-item-info h2 { margin: 4px 0; font-size: 20px; }
:root[data-theme="sky"] .cart-item-info p { color: var(--ink-muted); font-size: 16px; }
:root[data-theme="sky"] .cart-item > strong { font-size: 20px; }
:root[data-theme="sky"] .quantity-control { gap: 4px; padding: 4px; background: var(--sunken); border: 0; border-radius: 16px; }
:root[data-theme="sky"] .quantity-control button { width: 48px; height: 48px; color: var(--sky-deep); background: var(--surface); border: 1px solid var(--outline); border-radius: 12px; font-size: 22px; font-weight: 700; }
:root[data-theme="sky"] .quantity-control button:hover:not(:disabled) { color: #fff; background: var(--sky); border-color: var(--sky); }
:root[data-theme="sky"] .quantity-control button:disabled { color: var(--ink-faint); cursor: not-allowed; }
:root[data-theme="sky"] .quantity-control span { min-width: 32px; font-size: 18px; font-weight: 700; }
:root[data-theme="sky"] .remove-item { width: 56px; height: 56px; color: var(--coral-ink); border-radius: 16px; font-size: 28px; }
:root[data-theme="sky"] .remove-item:hover { background: var(--coral-soft); }
:root[data-theme="sky"] .checkout-card { position: sticky; top: 120px; padding: 32px; }
:root[data-theme="sky"] .checkout-card h2 { margin: 0 0 20px; font-size: 28px; }
:root[data-theme="sky"] .summary-line { padding: 10px 0; color: var(--ink-muted); }
:root[data-theme="sky"] .summary-line .free { color: var(--leaf-ink); }
:root[data-theme="sky"] .summary-total { margin: 8px 0 24px; padding-top: 16px; color: var(--ink); border-color: var(--outline); font-size: 22px; font-weight: 700; }
:root[data-theme="sky"] .summary-total strong { color: var(--sky-deep); font-size: 28px; }
:root[data-theme="sky"] .checkout-button span { float: none; }
:root[data-theme="sky"] .delete-cart, :root[data-theme="sky"] .checkout-card a { margin-top: 12px; }
@media (max-width: 1000px) {
    .cart-layout { grid-template-columns: 1fr; }
    :root[data-theme="sky"] .cart-layout { grid-template-columns: 1fr; }
    :root[data-theme="sky"] .checkout-card { position: static; }
}
@media (max-width: 640px) {
    .cart-page { padding: 26px 14px 50px; }
    .cart-header { align-items: start; flex-direction: column; gap: 8px; }
    .cart-item { grid-template-columns: 70px minmax(0, 1fr) auto; gap: 10px; }
    .cart-item img { width: 70px; height: 70px; }
    .cart-item > strong { grid-column: 2 / 4; grid-row: 2; justify-self: end; }
    .quantity-control { grid-column: 1 / 3; grid-row: 2; justify-self: start; }
    .remove-item { grid-column: 3; grid-row: 1; }
    :root[data-theme="sky"] .cart-item { grid-template-columns: 80px minmax(0, 1fr) 56px; }
    :root[data-theme="sky"] .cart-item img { width: 80px; height: 80px; }
    :root[data-theme="sky"] .quantity-control button { width: 40px; height: 40px; }
    :root[data-theme="sky"] .checkout-card { padding: 24px 20px; }
}
</style>
