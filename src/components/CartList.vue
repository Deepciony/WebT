<template>
    <section class="orders-page sk-page">
        <header class="orders-head sk-head">
            <p class="orders-kicker sk-kicker">{{ t('orders.kicker') }}</p>
            <h1>{{ t('orders.title') }}</h1>
            <p>{{ t('orders.lead') }}</p>
        </header>

        <p v-if="loading" class="orders-state" aria-busy="true">{{ t('db.loading') }}</p>

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
                            <span class="status" :class="cart.cartCf ? 'done' : 'open'">
                                {{ cart.cartCf ? t('cartdb.confirmed') : t('cartdb.open') }}
                            </span>
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
    </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { t } from '../i18n.js'

const carts = ref([])
const loading = ref(true)

const formattedDate = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

onMounted(async () => {
    try {
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

/* Skylearn */
:root[data-theme="sky"] .orders-head h1 { color: var(--ink); font-size: clamp(30px, 4vw, 40px); }
:root[data-theme="sky"] .orders-head p { color: var(--ink-muted); font-size: 18px; }
:root[data-theme="sky"] .orders-table { margin-top: 28px; border-color: var(--outline); border-radius: var(--r-card); }
:root[data-theme="sky"] table { font-size: 16px; }
:root[data-theme="sky"] th, :root[data-theme="sky"] td { padding: 16px 20px; border-color: var(--outline); }
:root[data-theme="sky"] th { color: var(--ink-muted); background: var(--sunken); font-size: 14px; }
:root[data-theme="sky"] tbody tr:hover { background: var(--bg); }
:root[data-theme="sky"] .order-link { color: var(--sky-deep); }
:root[data-theme="sky"] .status { padding: 6px 14px; font-size: 14px; }
@media (max-width: 640px) {
    .orders-page { padding: 26px 14px 50px; }
}
</style>
