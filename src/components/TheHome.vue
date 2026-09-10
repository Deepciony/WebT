<template>
    <h1>ยินดีต้อนรับสู่ร้านค้าประจำเกษตรศาสตร์ศรีราชา</h1>
    <div class="row">
        <div v-for="(pd,pdId) in product" :key="pdId" class="col-lg-4 col-md-6 col-sm-12">
            <div class="card mt-3" style="width: 18rem; background-color: #EEEEEE; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <img :src="`http://localhost:3000/img_pd/${String(pd.pdId - 3).padStart(3, '0')}.jpg`" class="card-img-top p-2" alt="รูปสินค้า">
                <div class="card-body">
                    <h5 class="card-title">{{ pd.pdName }}</h5>
                    <p class="card-text">{{ pd.brand?.brandName || 'ไม่ระบุแบรนด์' }} - ${{ pd.pdPrice }}</p>
                    <button class="btn btn-primary" type="button" @click="addProduct(pd)">เพิ่มลงตะกร้า</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { onMounted } from 'vue';
    import axios from 'axios';
    import { addToCart } from '../stores/cart.js';

    const product = ref([])
    const addProduct = (pd) => addToCart(pd)

    onMounted(async () => {
        await axios.get('http://localhost:3000/products/three').then((res) => {
            product.value = res.data
        })
        .catch((err) => {
            console.log(err)
        })
    })

</script>