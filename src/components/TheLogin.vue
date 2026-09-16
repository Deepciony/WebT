<template>
    <AuthLayout :heading="t('auth.welcome')" :highlight="t('auth.back')">
        <form @submit.prevent="handleSubmit">
            <h2>{{ t('auth.loginTitle') }}</h2>
            <label>{{ t('auth.email') }}<input v-model.trim="loginName" type="email" required autofocus autocomplete="username"></label>
            <label>{{ t('auth.password') }}<input v-model="password" type="password" required autocomplete="current-password"></label>
            <button class="auth-submit sk-btn sk-btn-big sk-btn-block" type="submit" :disabled="busy">{{ t('auth.submitLogin') }} <span>→</span></button>
        </form>

        <p v-if="message" class="auth-message sk-msg" role="status" :class="{ error: !login }">{{ t(message) }}</p>
        <router-link to="/register" class="auth-switch-link">{{ t('auth.toRegister') }}</router-link>
        <DevBypass v-if="DevBypass" />
    </AuthLayout>
</template>

<script setup>
import { defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore.js'
import { t } from '../i18n.js'
import AuthLayout from './AuthLayout.vue'

const DevBypass = import.meta.env.DEV ? defineAsyncComponent(() => import('./DevBypass.vue')) : null

const authStore = useAuthStore()
const router = useRouter()
const loginName = ref('')
const password = ref('')
const login = ref(false)
const message = ref('')
const busy = ref(false)

const handleSubmit = async () => {
    busy.value = true
    try {
        const response = await axios.post('http://localhost:3000/members/login', {
            loginName: loginName.value,
            password: password.value
        })
        login.value = response.data.login
        message.value = response.data.message
        if (login.value) {
            authStore.login()
            await authStore.getMember()
            router.push('/pagemember')
        }
    } catch (err) {
        console.log(err)
        login.value = false
        message.value = 'auth.loginFail'
    } finally {
        busy.value = false
    }
}
</script>
