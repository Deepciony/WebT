<template>
    <section class="database-page">
        <div class="database-heading">
            <div>
                <p class="database-kicker">SYSTEM DATABASE</p>
                <h1>ข้อมูลทั้งหมดในระบบ</h1>
                <p>ดูตาราง คอลัมน์ และรายการข้อมูลที่ระบบกำลังใช้งาน</p>
                <small class="security-note">รหัสผ่านจะแสดงเป็นสถานะเท่านั้น เพื่อความปลอดภัย</small>
            </div>
            <button class="refresh-button" type="button" @click="loadOverview">รีเฟรชข้อมูล</button>
        </div>

        <p v-if="error" class="database-error">{{ error }}</p>
        <p v-else-if="loading" class="database-loading">กำลังโหลดข้อมูล...</p>

        <div v-else class="database-tables">
            <article v-for="table in tables" :key="table.name" class="database-table">
                <div class="table-heading">
                    <div>
                        <span class="table-label">TABLE</span>
                        <h2>{{ table.name }}</h2>
                    </div>
                    <strong>{{ table.count }} รายการ</strong>
                </div>
                <div class="column-list">
                    <span v-for="column in table.columns" :key="column.column_name">
                        {{ column.column_name }} <small>{{ column.data_type }}</small>
                    </span>
                </div>
                <div v-if="table.rows.length" class="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th v-for="key in rowKeys(table.rows[0])" :key="key">{{ key }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, index) in table.rows" :key="index">
                                <td v-for="key in rowKeys(row)" :key="key">{{ formatValue(row[key]) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-else class="empty-table">ยังไม่มีข้อมูลในตารางนี้</p>
            </article>
            <p v-if="!tables.length" class="empty-table">ไม่พบตารางข้อมูลที่ระบบกำหนดไว้</p>
        </div>
    </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

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
        error.value = requestError.response?.data?.error || 'ไม่สามารถโหลดข้อมูลฐานข้อมูลได้'
    } finally {
        loading.value = false
    }
}

const rowKeys = (row) => Object.keys(row)
const formatValue = (value) => value === null || value === undefined ? '-' : value

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
.empty-table, .database-loading, .database-error { padding: 22px; color: #71808a; text-align: center; }
.database-error { color: #c0392b; }
@media (max-width: 800px) { .database-heading { align-items: start; flex-direction: column; } .database-tables { grid-template-columns: 1fr; } }
</style>
