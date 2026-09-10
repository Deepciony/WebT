<template>
    <section class="profile-page">
        <div class="profile-card">
            <div class="profile-avatar">{{ initials }}</div>
            <p class="profile-kicker">KUSHOP MEMBER</p>
            <form @submit.prevent="saveProfile">
                <label>Username<input v-model.trim="profileForm.username" type="text" required></label>
                <label>Email<input v-model.trim="profileForm.email" type="email" required></label>
                <div class="profile-details">
                    <div><span>สถานะ</span><strong>สมาชิก</strong></div>
                    <div><span>User ID</span><strong>#{{ profileForm.userId }}</strong></div>
                </div>
                <button class="profile-save" type="submit">บันทึกข้อมูล</button>
            </form>
            <p v-if="message" class="profile-message" :class="{ error: messageType === 'error' }">{{ message }}</p>
            <form class="password-form" @submit.prevent="changePassword">
                <h2>เปลี่ยนรหัสผ่าน</h2>
                <label>รหัสผ่านเดิม<input v-model="passwordForm.currentPassword" type="password" required autocomplete="current-password"></label>
                <label>รหัสผ่านใหม่<input v-model="passwordForm.newPassword" type="password" minlength="6" required autocomplete="new-password"></label>
                <label>ยืนยันรหัสผ่านใหม่<input v-model="passwordForm.confirmPassword" type="password" minlength="6" required autocomplete="new-password"></label>
                <button class="password-save" type="submit">บันทึกรหัสผ่าน</button>
            </form>
            <button class="profile-logout" type="button" @click="logout">ออกจากระบบ</button>
        </div>
    </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('kushopUser') || '{}')
const profileForm = reactive({
    userId: user.userId,
    username: user.username || '',
    email: user.email || ''
})
const initials = computed(() => (profileForm.username || 'KU').slice(0, 2).toUpperCase())
const message = ref('')
const messageType = ref('success')
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const saveProfile = async () => {
    try {
        const response = await axios.put('http://localhost:3000/auth/profile', profileForm)
        localStorage.setItem('kushopUser', JSON.stringify(response.data.user))
        messageType.value = 'success'
        message.value = 'แก้ไขข้อมูลสำเร็จ'
    } catch (error) {
        messageType.value = 'error'
        message.value = error.response?.data?.error || 'ไม่สามารถแก้ไขข้อมูลได้'
    }
}

const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        messageType.value = 'error'
        message.value = 'รหัสผ่านใหม่ไม่ตรงกัน'
        return
    }

    try {
        await axios.put('http://localhost:3000/auth/password', {
            username: profileForm.username,
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        })
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        messageType.value = 'success'
        message.value = 'เปลี่ยนรหัสผ่านสำเร็จ'
    } catch (error) {
        messageType.value = 'error'
        message.value = error.response?.data?.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
    }
}

const logout = () => {
    localStorage.removeItem('kushopUser')
    router.push({ name: 'Login' })
}
</script>

<style scoped>
.profile-page { display: grid; min-height: 620px; place-items: center; padding: 45px 20px; background: #f4f7f5; }
.profile-card { width: min(100%, 440px); padding: 40px; background: #fff; border: 1px solid #dce5df; border-radius: 12px; box-shadow: 0 14px 35px rgba(44, 62, 80, .1); text-align: center; }
.profile-avatar { width: 82px; height: 82px; display: grid; place-items: center; margin: 0 auto 20px; color: #fff; background: #198754; border-radius: 50%; font-size: 26px; font-weight: 700; }
.profile-kicker { margin-bottom: 8px; color: #198754; font-size: 11px; font-weight: 700; letter-spacing: .15em; }
.profile-card h1 { margin: 0 0 5px; color: #2c3e50; font-size: 30px; }
.profile-email { margin: 0 0 28px; color: #71808a; }
.profile-card label { display: block; margin-bottom: 14px; color: #47545b; font-size: 13px; font-weight: 700; text-align: left; }
.profile-card input { display: block; width: 100%; margin-top: 6px; padding: 10px 11px; border: 1px solid #ccd7d0; border-radius: 5px; outline: 0; }
.profile-card input:focus { border-color: #198754; box-shadow: 0 0 0 3px rgba(25, 135, 84, .12); }
.profile-details { margin-bottom: 25px; border-top: 1px solid #e4ebe7; }
.profile-details div { display: flex; justify-content: space-between; padding: 13px 0; border-bottom: 1px solid #e4ebe7; color: #71808a; font-size: 13px; }
.profile-details strong { color: #2c3e50; }
.profile-save { width: 100%; margin-bottom: 12px; padding: 12px; color: #fff; background: #198754; border: 0; border-radius: 5px; cursor: pointer; font-weight: 700; }
.profile-message { margin: 0 0 14px; color: #198754; font-size: 13px; }
.profile-message.error { color: #c0392b; }
.password-form { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e4ebe7; text-align: left; }
.password-form h2 { margin: 0 0 16px; color: #2c3e50; font-size: 20px; text-align: center; }
.password-save { width: 100%; padding: 11px; color: #2c3e50; background: #f0c75e; border: 0; border-radius: 5px; cursor: pointer; font-weight: 700; }
.profile-logout { width: 100%; margin-top: 14px; padding: 12px; color: #c0392b; background: #fff; border: 1px solid #e2b8b2; border-radius: 5px; cursor: pointer; font-weight: 700; }
.profile-logout:hover { color: #fff; background: #c0392b; }
</style>
