<template>
    <section class="cart-page sk-page">
        <SkyConfetti v-if="celebrate" />
        <header class="cart-header sk-head">
            <div><p class="page-kicker sk-kicker">{{ t('cart.kicker') }}</p><h1>{{ t('cart.title') }}</h1><p>{{ t('cart.lead') }}</p></div>
            <span class="cart-count sk-pill">{{ t('common.items', { n: cartCount }) }}</span>
        </header>

        <div v-if="cart.items.length" class="cart-layout">
            <div class="cart-items">
                <article v-for="(item, index) in cart.items" :key="item.pdId" class="cart-item sk-card">
                    <img :src="item.logosrc ? `http://localhost:3000${item.logosrc}` : `http://localhost:3000/products/${item.pdId}/image`" :alt="t('product.imgAlt')">
                    <div class="cart-item-info"><small>{{ item.brand?.brandName || 'KUSHOP' }}</small><h2>{{ item.pdName }}</h2><p class="sk-mono">${{ item.pdPrice }}</p></div>
                    <div class="quantity-control">
                        <button type="button" :disabled="item.quantity <= 1" :aria-label="t('cart.decrease', { name: item.pdName })" @click="updateQuantity(item.pdId, item.quantity - 1)">−</button>
                        <span class="sk-mono" aria-live="polite">{{ item.quantity }}</span>
                        <button type="button" :aria-label="t('cart.increase', { name: item.pdName })" @click="updateQuantity(item.pdId, item.quantity + 1)">+</button>
                    </div>
                    <strong class="sk-mono">${{ (Number(item.pdPrice) * item.quantity).toFixed(2) }}</strong>
                    <button class="remove-item" type="button" @click="removeFromCart(item.pdId, index)" :aria-label="t('cart.remove', { name: item.pdName })">×</button>
                </article>
            </div>
            <form class="checkout-card sk-panel sk-form" @submit.prevent="checkout">
                <p class="page-kicker sk-kicker">{{ t('cart.checkoutKicker') }}</p><h2>{{ t('cart.summary') }}</h2>
                <div class="summary-line"><span>{{ t('cart.itemsLine', { n: cartCount }) }}</span><strong class="sk-mono">${{ cartTotal.toFixed(2) }}</strong></div>
                <div class="summary-line"><span>{{ t('cart.shipping') }}</span><strong class="free">{{ t('cart.free') }}</strong></div>
                <div class="summary-total"><span>{{ t('cart.total') }}</span><strong class="sk-mono">${{ cartTotal.toFixed(2) }}</strong></div>
                <label>{{ t('cart.name') }}<input v-model.trim="customer.name" type="text" required :placeholder="t('cart.namePh')" autocomplete="name"></label>
                <label>{{ t('cart.phone') }}<input v-model.trim="customer.phone" type="tel" required placeholder="08x-xxx-xxxx" autocomplete="tel"></label>
                <label>{{ t('cart.address') }}<textarea v-model.trim="customer.address" rows="3" required :placeholder="t('cart.addressPh')" autocomplete="street-address"></textarea></label>
                <button class="checkout-button sk-btn sk-btn-big sk-btn-block sk-btn-leaf" type="submit">{{ t('cart.confirm') }} <span>→</span></button>
            </form>
        </div>
        <div v-else-if="message" class="order-done sk-panel" role="status">
            <span class="order-star">★</span>
            <h2>{{ t(message) }}</h2>
            <p>{{ t('cart.redirect') }}</p>
        </div>
        <div v-else class="empty-cart sk-empty"><span class="sk-empty-icon">○</span><h2>{{ t('cart.empty') }}</h2><p>{{ t('cart.emptyText') }}</p><router-link to="/product" class="sk-btn">{{ t('cart.browse') }}</router-link></div>
    </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import cart, { cartCount, cartTotal, clearCart, removeFromCart as remove, updateQuantity as update } from '../stores/cart.js'
import { isSky } from '../stores/theme.js'
import { t } from '../i18n.js'
import SkyConfetti from './SkyConfetti.vue'

const router = useRouter()
const customer = reactive({ name: '', phone: '', address: '' })
const message = ref('')
const celebrate = ref(false)
const updateQuantity = (id, quantity) => update(id, quantity)
const removeFromCart = (id) => remove(id)

const checkout = () => {
    message.value = 'cart.done'
    celebrate.value = isSky.value
    clearCart()
    setTimeout(() => router.push('/'), isSky.value ? 1800 : 900)
}
</script>

<style scoped>
.cart-page {
    max-width: 1180px;
    margin: 0 auto;
    padding: 42px 24px 70px;
    color: #243746;
}
.cart-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid #dce5df;
}
.page-kicker { margin: 0 0 8px; color: #198754; font-size: 11px; font-weight: 700; letter-spacing: .16em; }
.cart-header h1 { margin: 0 0 5px; font-size: 38px; }
.cart-header p { margin: 0; color: #71808a; }
.cart-count { color: #198754; font-weight: 700; }
.cart-layout { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(320px, .8fr); gap: 26px; align-items: start; }
.cart-items { min-width: 0; }
.cart-item {
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr) auto auto 28px;
    gap: 16px;
    align-items: center;
    margin-bottom: 12px;
    padding: 14px;
    background: #fff;
    border: 1px solid #dce5df;
    border-radius: 10px;
    box-shadow: 0 5px 16px rgba(44, 62, 80, .06);
}
.cart-item img { width: 92px; height: 92px; object-fit: contain; background: #f4f7f5; border-radius: 7px; }
.cart-item-info { min-width: 0; }
.cart-item-info small { color: #198754; font-size: 11px; font-weight: 700; }
.cart-item-info h2 { overflow: hidden; margin: 4px 0; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
.cart-item-info p { margin: 0; color: #71808a; }
.quantity-control { display: flex; align-items: center; gap: 9px; padding: 4px; border: 1px solid #d2ddd6; border-radius: 6px; }
.quantity-control button { width: 25px; height: 25px; border: 0; background: #f1f5f2; cursor: pointer; }
.quantity-control span { min-width: 18px; text-align: center; }
.remove-item { color: #c0392b; background: transparent; border: 0; cursor: pointer; font-size: 22px; }
.checkout-card { padding: 25px; background: #fff; border: 1px solid #dce5df; border-radius: 10px; box-shadow: 0 8px 24px rgba(44, 62, 80, .08); }
.checkout-card h2 { margin: 0 0 18px; font-size: 24px; }
.summary-line, .summary-total { display: flex; justify-content: space-between; padding: 9px 0; color: #71808a; }
.summary-total { margin: 8px 0 18px; padding-top: 15px; color: #243746; border-top: 1px solid #dce5df; font-size: 19px; }
.checkout-card label { display: block; margin-bottom: 13px; color: #47545b; font-size: 13px; font-weight: 700; }
.checkout-card input, .checkout-card textarea { display: block; width: 100%; margin-top: 6px; padding: 10px 11px; border: 1px solid #ccd7d0; border-radius: 5px; outline: 0; resize: vertical; }
.checkout-card input:focus, .checkout-card textarea:focus { border-color: #198754; box-shadow: 0 0 0 3px rgba(25, 135, 84, .12); }
.checkout-button { width: 100%; padding: 13px; color: #fff; background: #198754; border: 0; border-radius: 5px; cursor: pointer; font-weight: 700; }
.checkout-button:hover { background: #146c43; }
.checkout-button span { float: right; font-size: 19px; }
.checkout-message { margin: 13px 0 0; color: #198754; font-size: 13px; }
.empty-cart { padding: 90px 20px; text-align: center; }
.empty-cart span { color: #f0c75e; font-size: 52px; }
.empty-cart h2 { margin: 10px 0 6px; font-size: 25px; }
.empty-cart p { margin: 0 0 16px; color: #71808a; }
.empty-cart a { color: #198754; font-weight: 700; text-decoration: none; }
.order-done { padding: 70px 20px; text-align: center; }
.order-done h2 { margin: 10px 0 6px; font-size: 25px; }
.order-done p { margin: 0; color: #71808a; }
.order-star { color: #f0c75e; font-size: 52px; }
@media (max-width: 850px) { .cart-layout { grid-template-columns: 1fr; } }
@media (max-width: 560px) {
    .cart-page { padding: 26px 14px 50px; }
    .cart-header { align-items: start; flex-direction: column; gap: 8px; }
    .cart-header h1 { font-size: 32px; }
    .cart-item { grid-template-columns: 70px minmax(0, 1fr) auto; gap: 10px; }
    .cart-item img { width: 70px; height: 70px; }
    .cart-item > strong { grid-column: 2; }
    .quantity-control { grid-column: 3; grid-row: 1; }
    .remove-item { grid-column: 3; grid-row: 2; }
}

/* Skylearn */
:root[data-theme="sky"] .cart-page { color: var(--ink); }
:root[data-theme="sky"] .cart-header { align-items: flex-end; }
:root[data-theme="sky"] .cart-count { font-size: 16px; padding: 8px 16px; }
:root[data-theme="sky"] .cart-layout { grid-template-columns: minmax(0, 1.45fr) minmax(340px, .85fr); gap: 32px; }
:root[data-theme="sky"] .cart-item { grid-template-columns: 112px minmax(0, 1fr) auto auto 56px; gap: 20px; margin-bottom: 16px; padding: 16px; }
:root[data-theme="sky"] .cart-item img { width: 112px; height: 112px; padding: 8px; background: var(--sunken); border-radius: 14px; }
:root[data-theme="sky"] .cart-item-info small { color: var(--sky-deep); font-size: 14px; }
:root[data-theme="sky"] .cart-item-info h2 { margin: 4px 0; font-size: 20px; }
:root[data-theme="sky"] .cart-item-info p { color: var(--ink-muted); font-size: 16px; }
:root[data-theme="sky"] .cart-item > strong { font-size: 20px; }
:root[data-theme="sky"] .quantity-control { gap: 4px; padding: 4px; background: var(--sunken); border: 0; border-radius: 16px; }
:root[data-theme="sky"] .quantity-control button { width: 48px; height: 48px; color: var(--sky-deep); background: var(--surface); border: 1px solid var(--outline); border-radius: 12px; font-size: 22px; font-weight: 700; transition: background var(--dur); }
:root[data-theme="sky"] .quantity-control button:hover:not(:disabled) { color: #fff; background: var(--sky); border-color: var(--sky); }
:root[data-theme="sky"] .quantity-control button:disabled { color: var(--ink-faint); cursor: not-allowed; }
:root[data-theme="sky"] .quantity-control span { min-width: 32px; font-size: 18px; font-weight: 700; }
:root[data-theme="sky"] .remove-item { width: 56px; height: 56px; color: var(--coral-ink); border-radius: 16px; font-size: 28px; transition: background var(--dur); }
:root[data-theme="sky"] .remove-item:hover { background: var(--coral-soft); }
:root[data-theme="sky"] .checkout-card { position: sticky; top: 120px; padding: 32px; }
:root[data-theme="sky"] .checkout-card h2 { margin: 0 0 20px; font-size: 28px; }
:root[data-theme="sky"] .summary-line { padding: 10px 0; color: var(--ink-muted); }
:root[data-theme="sky"] .summary-line .free { color: var(--leaf-ink); }
:root[data-theme="sky"] .summary-total { margin: 8px 0 24px; padding-top: 16px; color: var(--ink); border-color: var(--outline); font-size: 22px; font-weight: 700; }
:root[data-theme="sky"] .summary-total strong { color: var(--sky-deep); font-size: 28px; }
:root[data-theme="sky"] .checkout-button { margin-top: 8px; }
:root[data-theme="sky"] .checkout-button span { float: none; }
:root[data-theme="sky"] .order-done { padding: 64px 24px; background: var(--leaf-soft); border-color: var(--leaf); box-shadow: none; }
:root[data-theme="sky"] .order-done h2 { margin: 16px 0 8px; font-size: 28px; }
:root[data-theme="sky"] .order-done p { color: var(--ink-muted); }
:root[data-theme="sky"] .order-star { display: inline-grid; place-items: center; width: 96px; height: 96px; color: #fff; background: var(--sun); border-radius: 999px; box-shadow: 0 0 24px rgba(252, 211, 77, .6); font-size: 56px; animation: sk-pop 480ms var(--ease); }
:root[data-theme="sky"] .empty-cart .sk-empty-icon { font-size: 40px; }
@media (max-width: 1000px) {
    :root[data-theme="sky"] .cart-layout { grid-template-columns: 1fr; }
    :root[data-theme="sky"] .checkout-card { position: static; }
}
@media (max-width: 640px) {
    :root[data-theme="sky"] .cart-header { align-items: flex-start; }
    :root[data-theme="sky"] .cart-item { grid-template-columns: 80px minmax(0, 1fr) 56px; gap: 12px; }
    :root[data-theme="sky"] .cart-item img { width: 80px; height: 80px; }
    :root[data-theme="sky"] .cart-item > strong { grid-column: 2 / 4; grid-row: 2; justify-self: end; }
    :root[data-theme="sky"] .quantity-control { grid-column: 1 / 3; grid-row: 2; justify-self: start; }
    :root[data-theme="sky"] .quantity-control button { width: 40px; height: 40px; }
    :root[data-theme="sky"] .remove-item { grid-column: 3; grid-row: 1; }
    :root[data-theme="sky"] .checkout-card { padding: 24px 20px; }
}
</style>
