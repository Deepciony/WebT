import { createRouter, createWebHistory } from 'vue-router';
import TheHome from '../components/TheHome.vue';
import TheProduct from '../components/PageProduct.vue';
import TheLogin from '../components/TheLogin.vue';
import ProductManage from '../components/ProductManage.vue';
import TheProfile from '../components/TheProfile.vue';
import DatabaseOverview from '../components/DatabaseOverview.vue';
import CartPage from '../components/CartPage.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: TheHome,
        meta: { requiresAuth: true },
    },
    {
        path: '/product',
        name: 'Product',
        component: TheProduct,
        meta: { requiresAuth: true },
    },
    {
        path: '/manage',
        name: 'ProductManage',
        component: ProductManage,
        meta: { requiresAuth: true },
    },
    {
        path: '/profile',
        name: 'Profile',
        component: TheProfile,
        meta: { requiresAuth: true },
    },
    {
        path: '/database',
        name: 'DatabaseOverview',
        component: DatabaseOverview,
        meta: { requiresAuth: true },
    },
    {
        path: '/cart',
        name: 'Cart',
        component: CartPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/login',
        name: 'Login',
        component: TheLogin,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const isLoggedIn = Boolean(localStorage.getItem('kushopUser'));

    if (to.meta.requiresAuth && !isLoggedIn) {
        return { name: 'Login' };
    }

    if (to.name === 'Login' && isLoggedIn) {
        return { name: 'Home' };
    }
});

export default router;