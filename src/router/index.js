import { createRouter, createWebHistory } from 'vue-router';
import TheHome from '../pages/TheHome.vue';
import TheProduct from '../pages/PageProduct.vue';
import TheLogin from '../pages/TheLogin.vue';
import TheRegister from '../pages/TheRegister.vue';
import PageMember from '../pages/PageMember.vue';
import ProductManage from '../pages/ProductManage.vue';
import DatabaseOverview from '../pages/DatabaseOverview.vue';
import ProductShow from '../pages/ProductShow.vue';
import CartShow from '../pages/CartShow.vue';
import CartList from '../pages/CartList.vue';
import { useAuthStore } from '../stores/authStore.js';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: TheHome,
    },
    {
        path: '/product',
        name: 'Product',
        component: TheProduct,
    },
    {
        path: '/manage',
        name: 'ProductManage',
        component: ProductManage,
        meta: { requiresAuth: true, requiresAdmin: true },
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
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        // The route carries the product id, so the path must name it too
        path: '/productshow/:pdId',
        name: 'ProductShow',
        component: ProductShow,
    },
    {
        path: '/cartshow/:cartId',
        name: 'CartShow',
        component: CartShow,
        meta: { requiresAuth: true },
    },
    {
        path: '/cartlist',
        name: 'CartList',
        component: CartList,
    },
    {
        path: '/cart',
        redirect: '/cartlist',
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

    if (to.meta.requiresAdmin && authStore.member?.dutyId !== 'admin') {
        return { name: 'PageMember' };
    }

    // Already signed in: skip the login/register pages
    if (to.meta.guestOnly && authStore.isLogin) {
        return { name: 'PageMember' };
    }
});

export default router;
