import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API = 'http://localhost:3000'

export const useCartStore = defineStore('cart', () => {
    const cartId = ref(null)
    const theQty = ref(0)
    const money = ref(0)

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
        try {
            await chkCart()
            await sumCart()
        } catch (err) {
            console.log(err.message)
            reset()
        }
    }

    // Creates the cart on first use, then adds the product to it
    const addProduct = async (product, qty = 1) => {
        if (!cartId.value) await chkCart()
        if (!cartId.value) await addCart()

        const res = await axios.post(`${API}/carts/addcartdtl`, {
            cartId: cartId.value,
            pdId: product.pdId,
            pdPrice: product.pdPrice,
            qty
        })
        if (!res.data.cartDtlOK) throw new Error(res.data.messageAddCartDtl)
        await sumCart()
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

    return { cartId, theQty, money, chkCart, addCart, sumCart, refresh, addProduct, setQty, removeProduct, deleteCart, confirmCart, reset }
})
