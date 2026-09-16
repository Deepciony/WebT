import { createRouter, createWebHistory } from 'vue-router';
import TheHome from '../components/TheHome.vue';
import TheProduct from '../components/PageProduct.vue';
import TheLogin from '../components/TheLogin.vue';
import TheRegister from '../components/TheRegister.vue';
import PageMember from '../components/PageMember.vue';
import ProductManage from '../components/ProductManage.vue';
import DatabaseOverview from '../components/DatabaseOverview.vue';
import CartPage from '../components/CartPage.vue';
import { useAuthStore } from '../stores/authStore.js';

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
        path: '/pagemember',
        name: 'PageMember',
        component: PageMember,
        meta: { requiresAuth: true },
    },
    {
        path: '/profile',
        redirect: '/pagemember',
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
        meta: { guestOnly: true },
    },
    {
        path: '/register',
        name: 'Register',
        component: TheRegister,
        meta: { guestOnly: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    // Check the token cookie once per page load; login/logout keep the store in sync after that
    if (!authStore.checked) await authStore.getMember();

    if (to.meta.requiresAuth && !authStore.isLogin) {
        return { name: 'Login' };
    }

    // Already signed in: skip the login/register pages
    if (to.meta.guestOnly && authStore.isLogin) {
        return { name: 'PageMember' };
    }
});

export default router;
