<template>
    <AuthLayout :heading="t('register.heading')" :highlight="t('register.highlight')">
        <form @submit.prevent="handleSubmit">
            <h2>{{ t('register.title') }}</h2>
            <label>{{ t('auth.email') }}<input v-model.trim="memEmail" type="email" required autofocus autocomplete="email"></label>
            <label>{{ t('register.name') }}<input v-model.trim="memName" type="text" required autocomplete="name"></label>
            <label>{{ t('auth.password') }}<input v-model="password" type="password" required autocomplete="new-password"></label>
            <button class="auth-submit sk-btn sk-btn-big sk-btn-block" type="submit" :disabled="busy">{{ t('register.submit') }} <span>→</span></button>
        </form>

        <p v-if="message" class="auth-message sk-msg" role="status" :class="{ error: !regist }">{{ t(message) }}</p>
        <router-link to="/login" class="auth-switch-link">{{ t('register.toLogin') }}</router-link>
    </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { t } from '../i18n.js'
import AuthLayout from './AuthLayout.vue'

const memEmail = ref('')
const memName = ref('')
const password = ref('')
const regist = ref(false)
const message = ref('')
const busy = ref(false)

const handleSubmit = async () => {
    busy.value = true
    try {
        const response = await axios.post('http://localhost:3000/members', {
            memEmail: memEmail.value,
            memName: memName.value,
            password: password.value
        })
        regist.value = response.data.regist
        message.value = response.data.message
        if (regist.value) password.value = ''
    } catch (err) {
        console.log(err)
        regist.value = false
        message.value = 'register.fail'
    } finally {
        busy.value = false
    }
}
</script>
