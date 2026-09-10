<template>
    <section class="cart-page">
        <header class="cart-header">
            <div><p class="page-kicker">YOUR SELECTION</p><h1>ตะกร้าสินค้า</h1><p>ตรวจสอบรายการก่อนชำระเงิน</p></div>
            <span class="cart-count">{{ cartCount }} รายการ</span>
        </header>

        <div v-if="cart.items.length" class="cart-layout">
            <div class="cart-items">
                <article v-for="(item, index) in cart.items" :key="item.pdId" class="cart-item">
                    <img :src="`http://localhost:3000/img_pd/${String(item.pdId - 3).padStart(3, '0')}.jpg`" alt="รูปสินค้า">
                    <div class="cart-item-info"><small>{{ item.brand?.brandName || 'KUSHOP' }}</small><h2>{{ item.pdName }}</h2><p>${{ item.pdPrice }}</p></div>
                    <div class="quantity-control"><button type="button" @click="updateQuantity(item.pdId, item.quantity - 1)">−</button><span>{{ item.quantity }}</span><button type="button" @click="updateQuantity(item.pdId, item.quantity + 1)">+</button></div>
                    <strong>${{ (Number(item.pdPrice) * item.quantity).toFixed(2) }}</strong>
                    <button class="remove-item" type="button" @click="removeFromCart(item.pdId, index)" aria-label="ลบสินค้า">×</button>
                </article>
            </div>
            <form class="checkout-card" @submit.prevent="checkout">
                <p class="page-kicker">CHECKOUT</p><h2>สรุปคำสั่งซื้อ</h2>
                <div class="summary-line"><span>สินค้า {{ cartCount }} ชิ้น</span><strong>${{ cartTotal.toFixed(2) }}</strong></div>
                <div class="summary-line"><span>ค่าจัดส่ง</span><strong>ฟรี</strong></div>
                <div class="summary-total"><span>ยอดรวม</span><strong>${{ cartTotal.toFixed(2) }}</strong></div>
                <label>ชื่อผู้รับ<input v-model.trim="customer.name" type="text" required placeholder="ชื่อ - นามสกุล"></label>
                <label>เบอร์โทรศัพท์<input v-model.trim="customer.phone" type="tel" required placeholder="08x-xxx-xxxx"></label>
                <label>ที่อยู่จัดส่ง<textarea v-model.trim="customer.address" rows="3" required placeholder="ที่อยู่สำหรับจัดส่ง"></textarea></label>
                <button class="checkout-button" type="submit">ยืนยันคำสั่งซื้อ <span>→</span></button>
                <p v-if="message" class="checkout-message">{{ message }}</p>
            </form>
        </div>
        <div v-else class="empty-cart"><span>○</span><h2>ยังไม่มีสินค้าในตะกร้า</h2><p>เลือกสินค้าที่ชอบ แล้วกลับมาชำระเงินที่นี่</p><router-link to="/product">เลือกชมสินค้า →</router-link></div>
    </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import cart, { addToCart, cartCount, cartTotal, clearCart, removeFromCart as remove, updateQuantity as update } from '../stores/cart.js'

const router = useRouter()
const customer = reactive({ name: '', phone: '', address: '' })
const message = ref('')
const updateQuantity = (id, quantity) => update(id, quantity)
const removeFromCart = (id) => remove(id)

const checkout = () => {
    message.value = 'รับคำสั่งซื้อเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ KUSHOP'
    clearCart()
    setTimeout(() => router.push('/'), 900)
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
</style>
