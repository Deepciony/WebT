import { computed, reactive } from 'vue'

const savedItems = JSON.parse(localStorage.getItem('kushopCart') || '[]')
const cart = reactive({ items: savedItems })

const persist = () => localStorage.setItem('kushopCart', JSON.stringify(cart.items))

export const cartCount = computed(() => cart.items.reduce((sum, item) => sum + item.quantity, 0))
export const cartTotal = computed(() => cart.items.reduce((sum, item) => sum + Number(item.pdPrice) * item.quantity, 0))

export const addToCart = (product) => {
    const existing = cart.items.find((item) => item.pdId === product.pdId)
    if (existing) existing.quantity += 1
    else cart.items.push({ ...product, quantity: 1 })
    persist()
}

export const updateQuantity = (productId, quantity) => {
    const item = cart.items.find((entry) => entry.pdId === productId)
    if (!item) return
    item.quantity = Math.max(1, Number(quantity) || 1)
    persist()
}

export const removeFromCart = (productId) => {
    cart.items = cart.items.filter((item) => item.pdId !== productId)
    persist()
}

export const clearCart = () => {
    cart.items = []
    persist()
}

export default cart
