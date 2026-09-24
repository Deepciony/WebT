<template>
    <router-link :to="target" class="cart-info" :class="isSky ? 'sky-cart' : 'nav-link'"
        :aria-label="t('nav.cartAria', { n: cartStore.theQty })">
        <SkyIcon v-if="isSky" name="cart" :size="24" />
        <span class="cart-info-label">{{ isSky || !cartStore.cartId ? t('nav.cart') : cartStore.cartId }}</span>
        <span class="cart-info-badge sk-mono">{{ cartStore.theQty }}</span>
        <span v-if="cartStore.money > 0" class="cart-info-money sk-mono">${{ cartStore.money.toFixed(2) }}</span>
    </router-link>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCartStore } from '../stores/cartStore.js'
import { isSky } from '../stores/theme.js'
import { t } from '../i18n.js'
import SkyIcon from './SkyIcon.vue'

const cartStore = useCartStore()

// No open cart yet? send them to the order history instead of a dead link
const target = computed(() => cartStore.cartId ? `/cartshow/${cartStore.cartId}` : '/cartlist')

onMounted(() => {
    cartStore.refresh()
})
</script>

<style scoped>
.cart-info-badge { margin-left: 4px; }
.cart-info-money { margin-left: 8px; }

/* Skylearn */
:root[data-theme="sky"] .cart-info-badge {
    display: grid;
    place-items: center;
    min-width: 28px;
    height: 28px;
    margin-left: 0;
    padding: 0 8px;
    color: var(--sky-deep);
    background: #fff;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
}
:root[data-theme="sky"] .cart-info-money { margin-left: 0; font-size: 15px; opacity: .9; }
@media (max-width: 900px) {
    :root[data-theme="sky"] .cart-info-money { display: none; }
}
</style>
