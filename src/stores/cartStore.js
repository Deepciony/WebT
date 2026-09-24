import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './authStore.js'

const API = 'http://localhost:3000'
const GUEST_CART_KEY = 'kushop-guest-cart'

export const useCartStore = defineStore('cart', () => {
    const cartId = ref(null)
    const theQty = ref(0)
    const money = ref(0)
    const guestItems = ref([])
    const authStore = useAuthStore()

    const loadGuestCart = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
            guestItems.value = Array.isArray(saved) ? saved : []
        } catch {
            guestItems.value = []
        }
    }

    const saveGuestCart = () => {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems.value))
        theQty.value = guestItems.value.reduce((sum, item) => sum + Number(item.qty), 0)
        money.value = guestItems.value.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0)
    }

    // Which cart is still open for this member (not confirmed yet)
    const chkCart = async () => {
        const res = await axios.post(`${API}/carts/chkcart`, {})
        cartId.value = res.data.cartExist ? res.data.cartId : null
        return cartId.value
    }

    const addCart = async () => {
        const res = await axios.post(`${API}/carts/addcart`, {})
        if (!res.data.cartOK) throw new Error(res.data.messageAddCart)
        cartId.value = res.data.messageAddCart
        return cartId.value
    }

    const sumCart = async (id = cartId.value) => {
        if (!id) {
            theQty.value = 0
            money.value = 0
            return
        }
        const res = await axios.get(`${API}/carts/sumcart/${id}`)
        theQty.value = Number(res.data.qty) || 0
        money.value = Number(res.data.money) || 0
    }

    // Read the open cart and its totals; used on load and after every change
    const refresh = async () => {
        loadGuestCart()
        if (!authStore.isLogin) {
            saveGuestCart()
            return
        }
        try {
            await chkCart()
            for (const item of guestItems.value) await addServerProduct(item)
            if (guestItems.value.length) {
                guestItems.value = []
                saveGuestCart()
            }
            await sumCart()
        } catch (err) {
            console.log(err.message)
            reset()
        }
    }

    const addServerProduct = async (product, qty = 1) => {
        if (!cartId.value) await chkCart()
        if (!cartId.value) await addCart()

        const res = await axios.post(`${API}/carts/addcartdtl`, {
            cartId: cartId.value,
            pdId: product.pdId,
            pdPrice: product.pdPrice ?? product.price,
            qty
        })
        if (!res.data.cartDtlOK) throw new Error(res.data.messageAddCartDtl)
    }

    // Creates the cart on first use, then adds the product to it
    const addProduct = async (product, qty = 1) => {
        if (!authStore.isLogin) {
            loadGuestCart()
            const existing = guestItems.value.find(item => item.pdId === product.pdId)
            if (existing) {
                existing.qty += qty
            } else {
                guestItems.value.push({
                    pdId: product.pdId,
                    pdName: product.pdName,
                    price: Number(product.pdPrice ?? product.price) || 0,
                    qty,
                    logosrc: product.logosrc || '',
                    brand: product.brand || null
                })
            }
            saveGuestCart()
            return
        }

        await addServerProduct(product, qty)
        await sumCart()
    }

    const removeGuestProduct = (pdId) => {
        loadGuestCart()
        guestItems.value = guestItems.value.filter(item => item.pdId !== pdId)
        saveGuestCart()
    }

    const adjustGuestQty = (pdId, qty) => {
        loadGuestCart()
        const item = guestItems.value.find(entry => entry.pdId === pdId)
        if (!item) return
        if (qty <= 0) {
            removeGuestProduct(pdId)
            return
        }
        item.qty = qty
        saveGuestCart()
    }

    const setQty = async (id, pdId, qty) => {
        const res = await axios.put(`${API}/carts/setcartdtlqty`, { cartId: id, pdId, qty })
        if (!res.data.cartDtlOK) throw new Error(res.data.messageAddCartDtl)
        await sumCart()
    }

    const removeProduct = async (id, pdId) => {
        const res = await axios.delete(`${API}/carts/delcartdtl/${id}/${pdId}`)
        if (!res.data.delOK) throw new Error(res.data.message)
        await refresh()
    }

    const deleteCart = async (id) => {
        const res = await axios.delete(`${API}/carts/delcart/${id}`)
        if (!res.data.delOK) throw new Error(res.data.message)
        await refresh()
    }

    // Confirming closes the cart, so the next add starts a new one
    const confirmCart = async (id) => {
        const res = await axios.put(`${API}/carts/cfcart/${id}`)
        if (!res.data.cfOK) throw new Error(res.data.message)
        await refresh()
    }

    const reset = () => {
        cartId.value = null
        theQty.value = 0
        money.value = 0
    }

    loadGuestCart()
    saveGuestCart()

    return { cartId, theQty, money, guestItems, chkCart, addCart, sumCart, refresh, addProduct, removeGuestProduct, adjustGuestQty, setQty, removeProduct, deleteCart, confirmCart, reset }
})
