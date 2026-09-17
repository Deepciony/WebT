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
            <article v-for="table in tables" :key="table.name" class="database-table sk-card">
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
                <div v-if="table.rows.length" class="table-scroll">
                    <table class="sk-mono">
                        <thead>
                            <tr>
                                <th v-for="key in rowKeys(table.rows[0])" :key="key">{{ key }}</th>
                                <th v-if="table.name === 'members'">{{ t('db.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, index) in table.rows" :key="index">
                                <td v-for="key in rowKeys(row)" :key="key">{{ formatValue(row[key]) }}</td>
                                <td v-if="table.name === 'members'">
                                    <button class="delete-member" type="button" @click="deleteMember(row.memEmail)">
                                        {{ t('db.delete') }}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-else class="empty-table">{{ t('db.empty') }}</p>
            </article>
            <p v-if="!tables.length" class="empty-table">{{ t('db.noTables') }}</p>
        </div>
    </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { t } from '../i18n.js'

const tables = ref([])
const loading = ref(true)
const error = ref('')

const loadOverview = async () => {
    loading.value = true
    error.value = ''
    try {
        const response = await axios.get('http://localhost:3000/database/overview')
        tables.value = response.data.tables
    } catch (requestError) {
        error.value = requestError.response?.data?.error || 'db.loadFail'
    } finally {
        loading.value = false
    }
}

const rowKeys = (row) => Object.keys(row)
const formatValue = (value) => value === null || value === undefined ? '-' : value

const deleteMember = async (memEmail) => {
    if (!window.confirm(t('db.confirmDelete', { email: memEmail }))) return

    error.value = ''
    try {
        await axios.delete(`http://localhost:3000/database/members/${encodeURIComponent(memEmail)}`)
        await loadOverview()
    } catch (requestError) {
        error.value = requestError.response?.data?.error || 'db.deleteMemberFail'
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
.database-tables { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; max-width: 1180px; margin: auto; }
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
@media (max-width: 800px) { .database-heading { align-items: start; flex-direction: column; } .database-tables { grid-template-columns: 1fr; } }

/* Skylearn: denser "parent view" styling for data */
:root[data-theme="sky"] .database-page { max-width: 1280px; margin: 0 auto; padding: 48px 24px 96px; background: none; }
:root[data-theme="sky"] .database-heading { max-width: none; align-items: flex-end; }
:root[data-theme="sky"] .database-heading h1 { color: var(--ink); }
:root[data-theme="sky"] .database-kicker { color: var(--sky-deep) !important; font-size: 14px; letter-spacing: .06em; }
:root[data-theme="sky"] .security-note { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; padding: 4px 12px; color: #92400e; background: #fef3c7; border-radius: 999px; font-size: 14px; }
:root[data-theme="sky"] .database-tables { max-width: none; gap: 32px; }
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
@media (max-width: 1000px) {
    :root[data-theme="sky"] .database-tables { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
    :root[data-theme="sky"] .database-page { padding: 32px 20px 64px; }
    :root[data-theme="sky"] .database-heading { align-items: stretch; }
}
</style>
