<template>
    <section class="manage-page">
        <div class="manage-heading">
            <div>
                <p class="manage-eyebrow">PRODUCT MANAGEMENT</p>
                <h1>แก้ไขข้อมูลสินค้า</h1>
                <p>เพิ่มสินค้าใหม่ หรือเลือกสินค้าจากรายการเพื่อแก้ไขข้อมูล</p>
            </div>
            <button class="manage-secondary" type="button" @click="resetForm">+ สินค้าใหม่</button>
        </div>

        <div class="manage-layout">
            <form class="manage-form" @submit.prevent="saveProduct">
                <div class="form-heading">
                    <span>{{ selectedId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</span>
                    <small>{{ selectedId ? `รหัสสินค้า ${selectedId}` : 'กรอกข้อมูลให้ครบถ้วน' }}</small>
                </div>

                <label>
                    ชื่อสินค้า
                    <input v-model.trim="form.pdName" type="text" required placeholder="เช่น เสื้อ KUSRC">
                </label>
                <div class="form-two-columns">
                    <label>
                        ราคา
                        <input v-model.number="form.pdPrice" type="number" min="0" step="0.01" required placeholder="0.00">
                    </label>
                    <label>
                        Brand ID
                        <input v-model.trim="form.brandId" type="text" required placeholder="B01">
                    </label>
                    <label>
                        Brand Name
                        <input v-model.trim="form.brandName" type="text" required placeholder="Brand A">
                    </label>
                </div>
                <label>
                    Product Type ID
                    <input v-model.trim="form.pdTypeId" type="text" required placeholder="T03">
                </label>
                <label>
                    รายละเอียดสินค้า
                    <textarea v-model.trim="form.pdRemark" rows="4" placeholder="รายละเอียดเพิ่มเติม"></textarea>
                </label>
                <div class="form-actions">
                    <button class="manage-primary" type="submit">{{ selectedId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า' }}</button>
                    <button class="manage-cancel" type="button" @click="resetForm">ล้างฟอร์ม</button>
                </div>
                <p v-if="message" class="manage-message" :class="{ error: messageType === 'error' }">{{ message }}</p>
            </form>

            <div class="manage-list">
                <div class="list-heading">
                    <h2>รายการสินค้า</h2>
                    <span>{{ products.length }} รายการ</span>
                </div>
                <div class="product-list">
                    <button v-for="product in products" :key="product.pdId" class="product-row" type="button" @click="editProduct(product)">
                        <span class="product-row-id">#{{ product.pdId }}</span>
                        <span class="product-row-name">{{ product.pdName }}</span>
                        <span class="product-row-price">${{ product.pdPrice }}</span>
                        <span class="product-row-action">แก้ไข</span>
                    </button>
                    <p v-if="!products.length" class="empty-list">ยังไม่มีข้อมูลสินค้า</p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'

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
        messageType.value = 'success'
        message.value = selectedId.value ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มสินค้าเรียบร้อยแล้ว'
        resetForm()
    } catch (error) {
        messageType.value = 'error'
        message.value = error.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้'
    }
}

onMounted(async () => {
    try {
        await loadProducts()
    } catch (error) {
        messageType.value = 'error'
        message.value = 'ไม่สามารถโหลดข้อมูลสินค้าได้'
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
</style>
