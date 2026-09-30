<template>
    <section class="database-page">
        <div class="database-heading sk-head">
            <div>
                <p class="database-kicker sk-kicker">{{ t('db.kicker') }}</p>
                <h1>{{ t('db.title') }}</h1>
                <p>{{ t('db.lead') }}</p>
                <small class="security-note">{{ t('db.note') }}</small>
            </div>
            <button class="refresh-button sk-btn sk-btn-soft" type="button" @click="loadOverview">{{ t('db.refresh') }}</button>
        </div>

        <p v-if="error" class="database-error sk-msg error" role="alert">{{ t(error) }}</p>
        <p v-else-if="loading" class="database-loading" aria-busy="true">{{ t('db.loading') }}</p>

        <div v-else class="database-tables">
            <div class="sk-filters" role="group" :aria-label="t('filter.title')">
                <label class="grow">{{ t('filter.table') }}<input v-model.trim="tableSearch" type="search" :placeholder="t('filter.rowSearchPh')"></label>
                <button class="sk-btn sk-btn-ghost" type="button" :disabled="!tableSearch" @click="tableSearch = ''">{{ t('filter.reset') }}</button>
            </div>
            <article v-for="table in shownTables" :key="table.name" class="database-table sk-card">
                <div class="table-heading">
                    <div>
                        <span class="table-label">{{ t('db.table') }}</span>
                        <h2>{{ table.name }}</h2>
                    </div>
                    <strong class="sk-pill">{{ t('common.items', { n: table.count }) }}</strong>
                </div>
                <div class="column-list">
                    <span v-for="column in table.columns" :key="column.column_name">
                        {{ column.column_name }} <small>{{ column.data_type }}</small>
                    </span>
                </div>
                <div v-if="table.rows.length" class="sk-filters row-filters" role="group">
                    <label class="grow">{{ t('filter.rowSearch') }}<input v-model.trim="rowFilters[table.name].keyword" type="search" :placeholder="t('filter.rowSearchPh')"></label>
                    <div class="filter-field grow">
                        <span class="filter-label">{{ t('filter.column') }}</span>
                        <SkySelect v-model="rowFilters[table.name].column" :options="columnOptions(table)" :aria-label="t('filter.column')" />
                    </div>
                    <span class="row-count sk-mono">{{ t('filter.rows', { n: visibleRows(table).length, total: table.rows.length }) }}</span>
                </div>
                <div v-if="table.rows.length" class="table-scroll">
                    <table class="sk-mono">
                        <thead>
                            <tr>
                                <th v-for="key in rowKeys(table.rows[0])" :key="key">{{ key }}</th>
                                <th v-if="deletableTable(table.name)">{{ t('db.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, index) in visibleRows(table)" :key="index">
                                <td v-for="key in rowKeys(row)" :key="key">{{ formatValue(row[key]) }}</td>
                                <td v-if="deletableTable(table.name)">
                                    <button v-if="canDeleteRow(table.name, row)" class="delete-member" type="button" @click="askDelete(table.name, row)">
                                        {{ t('db.delete') }}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-if="!visibleRows(table).length" class="empty-table">{{ t('filter.noRowMatch') }}</p>
                </div>
                <p v-else class="empty-table">{{ t('db.empty') }}</p>
            </article>
            <p v-if="!tables.length" class="empty-table">{{ t('db.noTables') }}</p>
            <p v-else-if="!shownTables.length" class="empty-table">{{ t('filter.noTableMatch') }}</p>
        </div>

        <div v-if="confirmState.open" class="confirm-overlay" @click.self="closeConfirm">
            <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="database-confirm-title">
                <h2 id="database-confirm-title">{{ t('db.confirmTitle') }}</h2>
                <p>{{ confirmState.message }}</p>
                <div class="confirm-actions">
                    <button class="sk-btn sk-btn-ghost" type="button" @click="closeConfirm">{{ t('db.cancel') }}</button>
                    <button class="sk-btn sk-btn-coral" type="button" @click="runConfirm">{{ t('db.delete') }}</button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { t } from '../i18n.js'
import { useAuthStore } from '../stores/authStore.js'
import SkySelect from './SkySelect.vue'

const authStore = useAuthStore()

// which column identifies a row, per table
const rowKey = { members: 'memEmail', carts: 'cartId', products: 'pdId', brands: 'brandId', pdTypes: 'pdTypeId' }
const isAdmin = () => authStore.member?.dutyId === 'admin'
const deletableTable = (name) => name in rowKey

// Admins may remove anything; everyone else only their own account and carts
const canDeleteRow = (name, row) => {
    if (name === 'members') return isAdmin() || authStore.member?.memEmail === row?.memEmail
    if (name === 'carts') return isAdmin() || authStore.member?.memEmail === row?.cusId
    return isAdmin()
}

const tables = ref([])
const loading = ref(true)
const error = ref('')
const confirmState = ref({ open: false, message: '', action: null })

const tableSearch = ref('')
const rowFilters = reactive({})
const shownTables = computed(() => {
    const keyword = tableSearch.value.toLowerCase()
    return tables.value.filter((table) => table.name.toLowerCase().includes(keyword))
})
const columnOptions = (table) => [{ value: '', label: t('filter.anyColumn') },
    ...table.columns.map((column) => ({ value: column.column_name, label: column.column_name }))]

const visibleRows = (table) => {
    const filter = rowFilters[table.name] || { keyword: '', column: '' }
    const keyword = filter.keyword.toLowerCase()
    if (!keyword) return table.rows
    return table.rows.filter((row) => {
        const keys = filter.column && filter.column in row ? [filter.column] : Object.keys(row)
        return keys.some((key) => String(row[key] ?? '').toLowerCase().includes(keyword))
    })
}

const loadOverview = async () => {
    loading.value = true
    error.value = ''
    try {
        const response = await axios.get('http://localhost:3000/database/overview')
        tables.value = response.data.tables
        for (const table of tables.value) rowFilters[table.name] ??= { keyword: '', column: '' }
    } catch (requestError) {
        error.value = requestError.response?.data?.error || 'db.loadFail'
    } finally {
        loading.value = false
    }
}

const rowKeys = (row) => Object.keys(row)
const formatValue = (value) => value === null || value === undefined ? '-' : value

const closeConfirm = () => {
    confirmState.value = { open: false, message: '', action: null }
}

const runConfirm = async () => {
    const action = confirmState.value.action
    closeConfirm()
    if (action) await action()
}

const askDelete = (name, row) => {
    const id = row[rowKey[name]]
    if (name === 'members') return deleteMember(id)
    if (name === 'carts') return deleteCart(id)
    confirmState.value = {
        open: true,
        message: t('db.confirmDeleteRow', { table: name, id }),
        action: async () => {
            error.value = ''
            try {
                await axios.delete(`http://localhost:3000/database/rows/${encodeURIComponent(name)}/${encodeURIComponent(id)}`)
                await loadOverview()
            } catch (requestError) {
                error.value = requestError.response?.data?.error || 'db.deleteRowFail'
            }
        }
    }
}

const deleteMember = async (memEmail) => {
    confirmState.value = {
        open: true,
        message: t('db.confirmDelete', { email: memEmail }),
        action: async () => {
            error.value = ''
            try {
                await axios.delete(`http://localhost:3000/database/members/${encodeURIComponent(memEmail)}`)
                await loadOverview()
            } catch (requestError) {
                error.value = requestError.response?.data?.error || 'db.deleteMemberFail'
            }
        }
    }
}

const deleteCart = async (cartId) => {
    confirmState.value = {
        open: true,
        message: t('db.confirmDeleteCart', { id: cartId }),
        action: async () => {
            error.value = ''
            try {
                await axios.delete(`http://localhost:3000/database/carts/${encodeURIComponent(cartId)}`)
                await loadOverview()
            } catch (requestError) {
                error.value = requestError.response?.data?.error || 'db.deleteCartFail'
            }
        }
    }
}

onMounted(loadOverview)
</script>

<style scoped>
.database-page { padding: 35px 20px 60px; background: #f5f7f6; }
.database-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin: 0 auto 28px; max-width: 1180px; }
.database-heading h1 { margin: 0 0 6px; color: #2c3e50; font-size: 34px; }
.database-heading p { margin: 0; color: #71808a; }
.security-note { display: block; margin-top: 6px; color: #9a6b18; font-size: 11px; }
.database-kicker, .table-label { color: #198754 !important; font-size: 11px; font-weight: 700; letter-spacing: .14em; }
.database-kicker { margin-bottom: 8px !important; }
.refresh-button { padding: 10px 16px; color: #fff; background: #2c3e50; border: 0; border-radius: 5px; cursor: pointer; font-weight: 700; }
.database-tables { display: grid; grid-template-columns: 1fr; gap: 22px; max-width: 1180px; margin: auto; }
.database-table { min-width: 0; overflow: hidden; background: #fff; border: 1px solid #dfe6e2; border-radius: 9px; box-shadow: 0 4px 15px rgba(44, 62, 80, .06); }
.table-heading { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 12px; }
.table-heading h2 { margin: 4px 0 0; color: #2c3e50; font-size: 22px; }
.table-heading strong { color: #198754; font-size: 13px; }
.column-list { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 20px 16px; }
.column-list span { padding: 4px 7px; color: #53636d; background: #edf5f0; border-radius: 4px; font-size: 11px; }
.column-list small { color: #198754; }
.table-scroll { overflow-x: auto; border-top: 1px solid #e6ebe8; }
table { width: 100%; border-collapse: collapse; font-size: 12px; white-space: nowrap; }
th, td { padding: 10px 12px; border-bottom: 1px solid #edf0ef; text-align: left; }
th { color: #53636d; background: #f7f9f8; font-size: 11px; }
td { color: #33434c; }
.delete-member { padding: 6px 10px; color: #c0392b; background: #fff; border: 1px solid #e2b8b2; border-radius: 5px; cursor: pointer; font-weight: 700; }
.delete-member:hover { color: #fff; background: #c0392b; }
.empty-table, .database-loading, .database-error { padding: 22px; color: #71808a; text-align: center; }
.database-error { color: #c0392b; }
.confirm-overlay { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; background: rgba(15, 23, 42, .5); }
.confirm-dialog { width: min(420px, calc(100vw - 32px)); padding: 24px; color: var(--ink); background: var(--surface); border: 1px solid var(--outline); border-radius: var(--r-card); box-shadow: var(--shadow-active); }
.confirm-dialog h2 { margin: 0 0 8px; font-size: 22px; }
.confirm-dialog p { margin: 0 0 22px; color: var(--ink-muted); }
.confirm-actions { display: flex; justify-content: flex-end; gap: 10px; }
.confirm-actions .sk-btn { min-width: 90px; }
@media (max-width: 800px) { .database-heading { align-items: start; flex-direction: column; } }

/* Skylearn: denser "parent view" styling for data */
:root[data-theme="sky"] .database-page { max-width: 1280px; margin: 0 auto; padding: 48px 24px 96px; background: none; }
:root[data-theme="sky"] .database-heading { max-width: none; align-items: flex-end; }
:root[data-theme="sky"] .database-heading h1 { color: var(--ink); }
:root[data-theme="sky"] .database-kicker { color: var(--sky-deep) !important; font-size: 14px; letter-spacing: .06em; }
:root[data-theme="sky"] .security-note { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; padding: 4px 12px; color: #92400e; background: #fef3c7; border-radius: 999px; font-size: 14px; }
:root[data-theme="sky"] .database-tables { max-width: none; gap: 28px; }
:root[data-theme="sky"] .table-heading { padding: 24px 24px 16px; }
:root[data-theme="sky"] .table-label { color: var(--ink-subtle) !important; font-size: 14px; letter-spacing: .08em; }
:root[data-theme="sky"] .table-heading h2 { color: var(--ink); font-family: var(--font-mono); font-size: 22px; }
:root[data-theme="sky"] .table-heading strong { font-size: 14px; }
:root[data-theme="sky"] .column-list { gap: 8px; padding: 0 24px 20px; }
:root[data-theme="sky"] .column-list span { padding: 4px 10px; color: var(--ink); background: var(--sunken); border-radius: 8px; font-family: var(--font-mono); font-size: 14px; }
:root[data-theme="sky"] .column-list small { color: var(--sky-deep); }
:root[data-theme="sky"] .table-scroll { max-height: 420px; overflow: auto; border-color: var(--outline); }
:root[data-theme="sky"] table { font-size: 14px; }
:root[data-theme="sky"] th, :root[data-theme="sky"] td { padding: 12px 16px; border-color: var(--outline); }
:root[data-theme="sky"] th { position: sticky; top: 0; color: var(--ink-muted); background: var(--sunken); font-size: 14px; }
:root[data-theme="sky"] td { color: var(--ink); }
:root[data-theme="sky"] .delete-member { color: var(--coral-ink); background: var(--surface); border-color: var(--coral); }
:root[data-theme="sky"] .delete-member:hover { color: #fff; background: var(--coral-ink); }
:root[data-theme="sky"] tbody tr:nth-child(even) { background: var(--bg); }
:root[data-theme="sky"] tbody tr:hover { background: var(--sky-soft); }
:root[data-theme="sky"] .empty-table, :root[data-theme="sky"] .database-loading { padding: 32px; color: var(--ink-muted); font-size: 16px; }
:root[data-theme="sky"] .database-error { justify-content: center; margin: 0 0 24px; padding: 16px 20px; color: var(--coral-ink); }
@media (max-width: 640px) {
    :root[data-theme="sky"] .database-page { padding: 32px 20px 64px; }
    :root[data-theme="sky"] .database-heading { align-items: stretch; }
}
</style>
