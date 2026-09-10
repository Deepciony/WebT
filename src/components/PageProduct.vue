<template>
    <form @submit.prevent="searchProducts">
        <div class="row">
            <div class="h1 col-md-6 col-sm-12text-danger">ผลิตภันฑ์ของเรา</div>
            <div class="col-md-4 col-sm-6">
                <input type="text" class="form-control" v-model="stext">
            </div>
            <div class="col">
                <button class="btn btn-primary" type="submit" @click="searchProducts()">ค้นหา</button>
            </div>
        </div>
    </form>
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
    const stext = ref('')
    const addProduct = (pd) => addToCart(pd)

    const searchProducts = async () => {
        const keyword = stext.value.trim()
        const endpoint = keyword
            ? `http://localhost:3000/search/products/${encodeURIComponent(keyword)}`
            : 'http://localhost:3000/products'

        await axios.get(endpoint).then((res) => {
            product.value = res.data
        })
        .catch((err) => {
            console.log(err)
        })
    }

    onMounted(async () => {
        await axios.get('http://localhost:3000/products').then((res) => {
            product.value = res.data
        })
        .catch((err) => {
            console.log(err)
        })
    })

</script>