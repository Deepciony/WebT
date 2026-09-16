<template>
    <section class="manage-page sk-page">
        <div class="manage-heading sk-head">
            <div>
                <p class="manage-eyebrow sk-kicker">{{ t('manage.kicker') }}</p>
                <h1>{{ t('manage.title') }}</h1>
                <p>{{ t('manage.lead') }}</p>
            </div>
            <button class="manage-secondary sk-btn sk-btn-soft" type="button" @click="resetForm">{{ t('manage.new') }}</button>
        </div>

        <div class="manage-layout">
            <form class="manage-form sk-panel sk-form" @submit.prevent="saveProduct">
                <div class="form-heading">
                    <span>{{ t(selectedId ? 'manage.editing' : 'manage.adding') }}</span>
                    <small>{{ selectedId ? t('manage.idLabel', { id: selectedId }) : t('manage.fillAll') }}</small>
                </div>

                <label>
                    {{ t('manage.name') }}
                    <input v-model.trim="form.pdName" type="text" required :placeholder="t('manage.namePh')">
                </label>
                <div class="form-two-columns">
                    <label>
                        {{ t('manage.price') }}
                        <input v-model.number="form.pdPrice" type="number" min="0" step="0.01" required placeholder="0.00">
                    </label>
                    <label>
                        {{ t('manage.brandId') }}
                        <input v-model.trim="form.brandId" type="text" required placeholder="B01">
                    </label>
                    <label>
                        {{ t('manage.brandName') }}
                        <input v-model.trim="form.brandName" type="text" required placeholder="Brand A">
                    </label>
                </div>
                <label>
                    {{ t('manage.typeId') }}
                    <input v-model.trim="form.pdTypeId" type="text" required placeholder="T03">
                </label>
                <label>
                    {{ t('manage.detail') }}
                    <textarea v-model.trim="form.pdRemark" rows="4" :placeholder="t('manage.detailPh')"></textarea>
                </label>
                <div class="form-actions">
                    <button class="manage-primary sk-btn" type="submit">{{ t(selectedId ? 'manage.saveEdit' : 'manage.add') }}</button>
                    <button class="manage-cancel sk-btn sk-btn-ghost" type="button" @click="resetForm">{{ t('manage.clear') }}</button>
                </div>
                <p v-if="message" class="manage-message sk-msg" role="status" :class="{ error: messageType === 'error' }">{{ t(message) }}</p>
            </form>

            <div class="manage-list sk-card">
                <div class="list-heading">
                    <h2>{{ t('manage.list') }}</h2>
                    <span>{{ t('common.items', { n: products.length }) }}</span>
                </div>
                <div class="product-list">
                    <button v-for="product in products" :key="product.pdId" class="product-row" :class="{ selected: selectedId === product.pdId }" type="button" @click="editProduct(product)">
                        <span class="product-row-id sk-mono">#{{ product.pdId }}</span>
                        <span class="product-row-name">{{ product.pdName }}</span>
                        <span class="product-row-price sk-mono">${{ product.pdPrice }}</span>
                        <span class="product-row-action">{{ t('manage.edit') }}</span>
                    </button>
                    <p v-if="!products.length" class="empty-list">{{ t('manage.empty') }}</p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { t } from '../i18n.js'

const products = ref([])
const selectedId = ref(null)
const message = ref('')
const messageType = ref('success')

const emptyForm = () => ({
    pdName: '',
    pdPrice: '',
    pdRemark: '',
    brandId: '',
    brandName: '',
    pdTypeId: ''
})

const form = reactive(emptyForm())

const loadProducts = async () => {
    const response = await axios.get('http://localhost:3000/products')
    products.value = response.data
}

const resetForm = () => {
    Object.assign(form, emptyForm())
    selectedId.value = null
    message.value = ''
}

const editProduct = (product) => {
    selectedId.value = product.pdId
    Object.assign(form, {
        pdName: product.pdName || '',
        pdPrice: product.pdPrice,
        pdRemark: product.pdRemark || '',
        brandId: product.brandId,
        brandName: product.brand?.brandName || '',
        pdTypeId: product.pdTypeId
    })
    message.value = ''
}

const saveProduct = async () => {
    try {
        const endpoint = selectedId.value
            ? `http://localhost:3000/products/${selectedId.value}`
            : 'http://localhost:3000/products'
        const method = selectedId.value ? 'put' : 'post'

        await axios({ method, url: endpoint, data: { ...form } })
        await loadProducts()
        const doneKey = selectedId.value ? 'manage.updated' : 'manage.added'
        resetForm()
        messageType.value = 'success'
        message.value = doneKey
    } catch (error) {
        messageType.value = 'error'
        message.value = error.response?.data?.error || 'manage.saveFail'
    }
}

onMounted(async () => {
    try {
        await loadProducts()
    } catch (error) {
        messageType.value = 'error'
        message.value = 'manage.loadFail'
    }
})
</script>

<style scoped>
.manage-page { padding: 30px 0 60px; }
.manage-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 28px; }
.manage-heading h1 { margin: 0 0 6px; color: #2c3e50; font-size: 34px; }
.manage-heading p { margin: 0; color: #68737d; }
.manage-eyebrow { margin-bottom: 8px !important; color: #198754 !important; font-size: 12px; font-weight: 700; letter-spacing: .12em; }
.manage-layout { display: grid; grid-template-columns: minmax(280px, 390px) minmax(0, 1fr); gap: 28px; align-items: start; }
.manage-form, .manage-list { padding: 24px; background: #fff; border: 1px solid #dfe4e8; border-radius: 10px; box-shadow: 0 5px 18px rgba(44, 62, 80, .08); }
.form-heading, .list-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 22px; color: #2c3e50; font-weight: 700; }
.form-heading small, .list-heading span { color: #88939d; font-size: 12px; font-weight: 400; }
.manage-form label { display: block; margin-bottom: 16px; color: #39444d; font-size: 14px; font-weight: 700; }
.manage-form input, .manage-form textarea { display: block; width: 100%; margin-top: 6px; padding: 10px 11px; color: #2c3e50; border: 1px solid #cfd7de; border-radius: 5px; outline: 0; font-size: 14px; }
.manage-form input:focus, .manage-form textarea:focus { border-color: #198754; box-shadow: 0 0 0 3px rgba(25, 135, 84, .12); }
.form-two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-actions { display: flex; gap: 10px; margin-top: 20px; }
.manage-primary, .manage-secondary, .manage-cancel { padding: 10px 16px; border: 0; border-radius: 5px; cursor: pointer; font-weight: 700; }
.manage-primary { color: #fff; background: #198754; }
.manage-secondary { color: #fff; background: #2c3e50; }
.manage-cancel { color: #52606d; background: #edf0f2; }
.manage-message { margin: 16px 0 0; color: #198754; font-size: 13px; }
.manage-message.error { color: #c0392b; }
.list-heading h2 { margin: 0; font-size: 22px; }
.product-list { overflow: hidden; border: 1px solid #e3e7ea; border-radius: 6px; }
.product-row { width: 100%; display: grid; grid-template-columns: 52px minmax(0, 1fr) 90px 55px; gap: 10px; align-items: center; padding: 14px 12px; color: #2c3e50; background: #fff; border: 0; border-bottom: 1px solid #e9edef; text-align: left; cursor: pointer; }
.product-row:last-child { border-bottom: 0; }
.product-row:hover { background: #f3f8f5; }
.product-row-id, .product-row-action { color: #81909c; font-size: 12px; }
.product-row-name { overflow: hidden; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.product-row-price { text-align: right; }
.product-row-action { color: #198754; text-align: right; }
.empty-list { margin: 0; padding: 28px; color: #88939d; text-align: center; }
@media (max-width: 760px) {
    .manage-heading { align-items: start; flex-direction: column; }
    .manage-layout { grid-template-columns: 1fr; }
}
@media (max-width: 460px) {
    .manage-page { padding-top: 18px; }
    .manage-form, .manage-list { padding: 16px; }
    .product-row { grid-template-columns: 42px minmax(0, 1fr) 70px; }
    .product-row-action { display: none; }
}

/* Skylearn */
:root[data-theme="sky"] .manage-heading { align-items: flex-end; }
:root[data-theme="sky"] .manage-heading h1 { color: var(--ink); }
:root[data-theme="sky"] .manage-eyebrow { margin-bottom: 8px !important; color: var(--sky-deep) !important; }
:root[data-theme="sky"] .manage-layout { grid-template-columns: minmax(320px, 460px) minmax(0, 1fr); gap: 32px; }
:root[data-theme="sky"] .manage-form { position: sticky; top: 120px; padding: 32px; }
:root[data-theme="sky"] .manage-list { padding: 32px; }
:root[data-theme="sky"] .form-heading, :root[data-theme="sky"] .list-heading { margin-bottom: 24px; color: var(--ink); font-family: var(--font-display); font-size: 24px; }
:root[data-theme="sky"] .form-heading small, :root[data-theme="sky"] .list-heading span { color: var(--ink-muted); font-family: var(--font-body); font-size: 16px; }
:root[data-theme="sky"] .list-heading h2 { font-size: 24px; }
:root[data-theme="sky"] .form-two-columns { gap: 0 16px; }
:root[data-theme="sky"] .form-two-columns label:last-child { grid-column: 1 / -1; }
:root[data-theme="sky"] .form-actions { flex-wrap: wrap; gap: 12px; margin-top: 8px; }
:root[data-theme="sky"] .form-actions .sk-btn { flex: 1 1 160px; }
:root[data-theme="sky"] .product-list { display: grid; gap: 8px; overflow: visible; border: 0; }
:root[data-theme="sky"] .product-row {
    grid-template-columns: 64px minmax(0, 1fr) auto auto;
    gap: 16px;
    min-height: 64px;
    padding: 12px 16px;
    color: var(--ink);
    background: var(--surface);
    border: 1px solid var(--outline);
    border-radius: 16px;
    font-family: var(--font-body);
    font-size: 18px;
    transition: border-color var(--dur), background var(--dur), transform var(--dur) var(--ease);
}
:root[data-theme="sky"] .product-row:last-child { border-bottom: 1px solid var(--outline); }
:root[data-theme="sky"] .product-row:hover { background: var(--bg); border-color: var(--sky-bright); transform: translateX(4px); }
:root[data-theme="sky"] .product-row.selected { background: var(--sky-soft); border: 3px solid var(--sky); box-shadow: var(--shadow-active); }
:root[data-theme="sky"] .product-row-id { color: var(--ink-subtle); font-size: 14px; }
:root[data-theme="sky"] .product-row-price { font-weight: 700; }
:root[data-theme="sky"] .product-row-action { padding: 6px 14px; color: var(--sky-deep); background: var(--sky-soft); border-radius: 999px; font-size: 14px; font-weight: 700; }
:root[data-theme="sky"] .empty-list { padding: 48px 24px; color: var(--ink-muted); background: var(--sunken); border: 2px dashed var(--outline-strong); border-radius: 16px; }
@media (max-width: 960px) {
    :root[data-theme="sky"] .manage-layout { grid-template-columns: 1fr; }
    :root[data-theme="sky"] .manage-form { position: static; }
}
@media (max-width: 520px) {
    :root[data-theme="sky"] .manage-heading { align-items: stretch; }
    :root[data-theme="sky"] .manage-form, :root[data-theme="sky"] .manage-list { padding: 24px 16px; }
    :root[data-theme="sky"] .form-two-columns { grid-template-columns: 1fr; }
    :root[data-theme="sky"] .product-row { grid-template-columns: 48px minmax(0, 1fr) auto; }
}
</style>
