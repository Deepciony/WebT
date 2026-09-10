<template>
    <section class="auth-page">
        <div class="auth-intro">
            <p class="auth-kicker">KUSHOP MEMBERS</p>
            <h1>ยินดีต้อนรับ<br><em>กลับมา</em></h1>
            <p>จัดการบัญชีสมาชิกและเลือกซื้อสินค้าจากร้าน KU Shop ได้ในที่เดียว</p>
        </div>

        <div class="auth-card">
            <div class="auth-tabs">
                <button type="button" :class="{ active: mode === 'login' }" @click="setMode('login')">เข้าสู่ระบบ</button>
                <button type="button" :class="{ active: mode === 'register' }" @click="setMode('register')">สมัครสมาชิก</button>
                <button type="button" :class="{ active: mode === 'password' }" @click="setMode('password')">เปลี่ยนรหัส</button>
            </div>

            <form v-if="mode === 'login'" @submit.prevent="submitLogin">
                <h2>เข้าสู่ระบบ</h2>
                <label>Username<input v-model.trim="loginForm.username" type="text" required autocomplete="username"></label>
                <label>Password<input v-model="loginForm.password" type="password" required autocomplete="current-password"></label>
                <button class="auth-submit" type="submit">เข้าสู่ระบบ <span>→</span></button>
            </form>

            <form v-else-if="mode === 'register'" @submit.prevent="submitRegister">
                <h2>สร้างบัญชีใหม่</h2>
                <label>Username<input v-model.trim="registerForm.username" type="text" required autocomplete="username"></label>
                <label>Email<input v-model.trim="registerForm.email" type="email" required autocomplete="email"></label>
                <label>Password<input v-model="registerForm.password" type="password" minlength="6" required autocomplete="new-password"></label>
                <button class="auth-submit" type="submit">สมัครสมาชิก <span>→</span></button>
            </form>

            <form v-else @submit.prevent="submitPasswordChange">
                <h2>เปลี่ยนรหัสผ่าน</h2>
                <label>Username<input v-model.trim="passwordForm.username" type="text" required autocomplete="username"></label>
                <label>รหัสผ่านเดิม<input v-model="passwordForm.currentPassword" type="password" required autocomplete="current-password"></label>
                <label>รหัสผ่านใหม่<input v-model="passwordForm.newPassword" type="password" minlength="6" required autocomplete="new-password"></label>
                <button class="auth-submit" type="submit">บันทึกรหัสใหม่ <span>→</span></button>
            </form>

            <p v-if="message" class="auth-message" :class="{ error: messageType === 'error' }">{{ message }}</p>
        </div>
    </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const mode = ref('login')
const message = ref('')
const messageType = ref('success')

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', email: '', password: '' })
const passwordForm = reactive({ username: '', currentPassword: '', newPassword: '' })

const setMode = (nextMode) => {
    mode.value = nextMode
    message.value = ''
}

const showResult = (text, type = 'success') => {
    message.value = text
    messageType.value = type
}

const submitLogin = async () => {
    try {
        const response = await axios.post('http://localhost:3000/auth/login', loginForm)
        localStorage.setItem('kushopUser', JSON.stringify(response.data.user))
        await router.push({ name: 'Home' })
    } catch (error) {
        showResult(error.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ', 'error')
    }
}

const submitRegister = async () => {
    try {
        await axios.post('http://localhost:3000/auth/register', registerForm)
        registerForm.username = ''
        registerForm.email = ''
        registerForm.password = ''
        setMode('login')
        showResult('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ')
    } catch (error) {
        showResult(error.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ', 'error')
    }
}

const submitPasswordChange = async () => {
    try {
        await axios.put('http://localhost:3000/auth/password', passwordForm)
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        showResult('เปลี่ยนรหัสผ่านสำเร็จ')
    } catch (error) {
        showResult(error.response?.data?.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ', 'error')
    }
}
</script>

<style scoped>
.auth-page { display: grid; grid-template-columns: 1fr minmax(340px, 440px); gap: 70px; align-items: center; min-height: 650px; padding: 50px 4%; background: linear-gradient(120deg, #f7f8f5, #eef5f0); }
.auth-intro { max-width: 520px; }
.auth-kicker { margin-bottom: 18px; color: #198754; font-size: 12px; font-weight: 700; letter-spacing: .16em; }
.auth-intro h1 { margin: 0 0 20px; color: #2c3e50; font-size: clamp(42px, 6vw, 72px); line-height: .95; }
.auth-intro h1 em { color: #198754; font-style: normal; }
.auth-intro > p:last-child { max-width: 390px; color: #6b7780; font-size: 16px; }
.auth-card { padding: 28px; background: #fff; border: 1px solid #dce5df; border-radius: 12px; box-shadow: 0 14px 35px rgba(44, 62, 80, .1); }
.auth-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 28px; padding: 4px; background: #f0f3f1; border-radius: 7px; }
.auth-tabs button { padding: 9px 4px; color: #7b858b; background: transparent; border: 0; border-radius: 5px; cursor: pointer; font-size: 12px; }
.auth-tabs button.active { color: #fff; background: #2c3e50; }
.auth-card h2 { margin: 0 0 22px; color: #2c3e50; font-size: 25px; }
.auth-card label { display: block; margin-bottom: 15px; color: #47545b; font-size: 13px; font-weight: 700; }
.auth-card input { display: block; width: 100%; margin-top: 6px; padding: 11px 12px; border: 1px solid #ccd7d0; border-radius: 5px; outline: 0; }
.auth-card input:focus { border-color: #198754; box-shadow: 0 0 0 3px rgba(25, 135, 84, .12); }
.auth-submit { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding: 12px 15px; color: #fff; background: #198754; border: 0; border-radius: 5px; cursor: pointer; font-weight: 700; }
.auth-submit span { font-size: 20px; }
.auth-message { margin: 17px 0 0; color: #198754; font-size: 13px; }
.auth-message.error { color: #c0392b; }
@media (max-width: 760px) { .auth-page { grid-template-columns: 1fr; gap: 28px; min-height: auto; padding: 35px 20px 50px; } .auth-intro h1 { font-size: 48px; } }
</style>