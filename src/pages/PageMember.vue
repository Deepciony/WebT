<template>
    <section class="member-page">
        <div class="member-card sk-panel">
            <div class="member-photo">
                <img :src="photoUrl" :alt="member?.memName || t('profile.kicker')">
            </div>
            <p class="member-kicker sk-kicker">{{ t('profile.kicker') }}</p>
            <h1>{{ member?.memName }}</h1>

            <dl class="member-details">
                <div><dt>{{ t('auth.email') }}</dt><dd>{{ member?.memEmail }}</dd></div>
                <div><dt>{{ t('member.duty') }}</dt><dd><span class="sk-pill">{{ member?.dutyId || '-' }}</span></dd></div>
                <div><dt>{{ t('profile.status') }}</dt><dd class="member-online">{{ t('member.signedIn') }}</dd></div>
            </dl>

            <form class="photo-form" @submit.prevent="uploadFile">
                <p class="photo-title">{{ t('photo.title') }}</p>
                <p class="photo-hint">{{ t('photo.choose') }}</p>
                <label class="sk-file">
                    <input type="file" accept="image/jpeg,image/png,image/webp" @change="onFileChange">
                    <span class="sk-file-btn">{{ t('photo.browse') }}</span>
                    <span class="sk-file-name" :class="{ picked: fileName }">{{ fileName || t('photo.noFile') }}</span>
                </label>
                <button class="sk-btn sk-btn-block" type="submit" :disabled="uploading">
                    {{ uploading ? t('photo.uploading') : t('photo.upload') }}
                </button>
                <button v-if="photoPath" class="photo-remove sk-btn sk-btn-coral sk-btn-block" type="button"
                    :disabled="uploading" @click="removePhoto">
                    {{ t('photo.remove') }}
                </button>
                <div class="photo-presets">
                    <span>{{ t('photo.presets') }}</span>
                    <button v-for="name in presets" :key="name" class="photo-preset" type="button"
                        :disabled="uploading" :title="t('photo.usePreset')" @click="usePreset(name)">
                        <img :src="`${API}/img_mem/${name}`" alt="">
                    </button>
                </div>
                <p v-if="fileMessage" class="photo-message sk-msg" :class="{ error: fileError }" role="status">{{ t(fileMessage) }}</p>
            </form>

            <button class="profile-edit-button sk-btn sk-btn-block" type="button" @click="openEditor">
                {{ t('profile.edit') }}
            </button>
            <form v-if="editing" class="profile-form" @submit.prevent="saveProfile">
                <label>
                    {{ t('register.name') }}
                    <input v-model="profileForm.memName" type="text" maxlength="100" required autocomplete="name">
                </label>
                <label>
                    {{ t('profile.currentPassword') }}
                    <input v-model="profileForm.currentPassword" type="password" autocomplete="current-password">
                </label>
                <label>
                    {{ t('profile.newPassword') }}
                    <input v-model="profileForm.newPassword" type="password" minlength="6" autocomplete="new-password">
                </label>
                <label>
                    {{ t('profile.confirmPassword') }}
                    <input v-model="profileForm.confirmPassword" type="password" minlength="6" autocomplete="new-password">
                </label>
                <p v-if="profileError" class="profile-message profile-error" role="alert">{{ t(profileError) }}</p>
                <p v-if="profileSaved" class="profile-message profile-success" role="status">{{ t('profile.saved') }}</p>
                <div class="profile-form-actions">
                    <button class="profile-save sk-btn sk-btn-block" type="submit" :disabled="saving">
                        {{ saving ? t('profile.saving') : t('profile.save') }}
                    </button>
                    <button class="profile-cancel sk-btn sk-btn-block" type="button" @click="editing = false">
                        {{ t('profile.cancel') }}
                    </button>
                </div>
            </form>
            <router-link to="/product" class="member-shop sk-btn sk-btn-block">{{ t('home.browse') }} →</router-link>
            <button class="member-logout sk-btn sk-btn-coral sk-btn-block" type="button" @click="logout">{{ t('profile.logout') }}</button>
        </div>
    </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore.js'
import { t } from '../i18n.js'

const authStore = useAuthStore()
const router = useRouter()
const member = computed(() => authStore.member)
const API = 'http://localhost:3000'
const presets = ['avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg']
const photoPath = ref(null)
// bumped after an upload so the browser fetches the new file instead of the cached one
const photoStamp = ref(Date.now())
const file = ref(null)
const fileMessage = ref('')
const fileError = ref(false)
const uploading = ref(false)

// the API reports the stored file (any format), so nothing has to be guessed here
const photoUrl = computed(() => photoPath.value
    ? `${API}${photoPath.value}?t=${photoStamp.value}`
    : `${API}/img_mem/default.jpg`)
watch(() => member.value?.memEmail, () => {
    photoPath.value = member.value?.photo || null
    photoStamp.value = Date.now()
}, { immediate: true })

const sendPhoto = async (blob, name) => {
    uploading.value = true
    fileMessage.value = ''
    fileError.value = false
    try {
        const formData = new FormData()
        formData.append('file', blob, name)
        const response = await axios.post(`${API}/members/uploadimg`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        fileMessage.value = response.data.message || 'photo.uploaded'
        photoPath.value = response.data.photo || photoPath.value
        photoStamp.value = Date.now()
    } catch (err) {
        fileError.value = true
        fileMessage.value = err.response?.data?.error || 'photo.uploadFail'
    } finally {
        uploading.value = false
    }
}

const removePhoto = async () => {
    uploading.value = true
    fileMessage.value = ''
    fileError.value = false
    try {
        await axios.delete(`${API}/members/photo`)
        photoPath.value = null
        file.value = null
        fileMessage.value = 'photo.removed'
    } catch (err) {
        fileError.value = true
        fileMessage.value = err.response?.data?.error || 'photo.removeFail'
    } finally {
        uploading.value = false
    }
}

const onFileChange = (event) => { file.value = event.target.files?.[0] || null }
const fileName = computed(() => file.value?.name || '')

const uploadFile = async () => {
    if (!file.value) {
        fileError.value = true
        fileMessage.value = 'photo.pickFirst'
        return
    }
    await sendPhoto(file.value, file.value.name)
}

const usePreset = async (name) => {
    try {
        const response = await fetch(`${API}/img_mem/${name}`)
        await sendPhoto(await response.blob(), name)
    } catch (err) {
        console.log(err.message)
        fileError.value = true
        fileMessage.value = 'photo.uploadFail'
    }
}
const editing = ref(false)
const saving = ref(false)
const profileError = ref('')
const profileSaved = ref(false)
const profileForm = reactive({ memName: '', currentPassword: '', newPassword: '', confirmPassword: '' })

const openEditor = () => {
    profileForm.memName = member.value?.memName || ''
    profileForm.currentPassword = ''
    profileForm.newPassword = ''
    profileForm.confirmPassword = ''
    profileError.value = ''
    profileSaved.value = false
    editing.value = true
}

const saveProfile = async () => {
    profileError.value = ''
    profileSaved.value = false
    saving.value = true
    try {
        await authStore.updateProfile({ ...profileForm })
        profileForm.currentPassword = ''
        profileForm.newPassword = ''
        profileForm.confirmPassword = ''
        profileSaved.value = true
    } catch (error) {
        profileError.value = error.response?.data?.error || 'profile.updateFail'
    } finally {
        saving.value = false
    }
}

const logout = async () => {
    await authStore.memLogout()
    router.push('/login')
}
</script>

<style scoped>
.member-page { display: grid; min-height: 620px; place-items: center; padding: 45px 20px; background: #f4f7f5; }
.member-card { width: min(100%, 440px); padding: 40px; background: #fff; border: 1px solid #dce5df; border-radius: 12px; box-shadow: 0 14px 35px rgba(44, 62, 80, .1); text-align: center; }
.member-photo { width: 120px; height: 120px; overflow: hidden; margin: 0 auto 20px; background: var(--sunken, #eef2f5); border: 3px solid var(--sky, #198754); border-radius: 50%; }
.member-photo img { width: 100%; height: 100%; object-fit: cover; }
.photo-form { margin: 0 0 20px; padding: 18px; background: var(--sunken, #f7faf8); border: 1px solid var(--outline, #dce8df); border-radius: 12px; text-align: left; }
.photo-title { margin: 0 0 12px; color: var(--ink, #2c3e50); font-size: 15px; font-weight: 700; }
.photo-hint { margin: 0 0 8px; color: var(--ink-muted, #53636d); font-size: 13px; font-weight: 400; }
.photo-form .sk-file { margin-bottom: 12px; }
.photo-remove { margin-top: 10px; }
.photo-presets { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 14px; color: var(--ink-muted, #53636d); font-size: 13px; font-weight: 700; }
.photo-preset { width: 52px; height: 52px; overflow: hidden; padding: 0; background: var(--surface, #fff); border: 2px solid var(--outline, #dce8df); border-radius: 50%; cursor: pointer; }
.photo-preset:hover:not(:disabled) { border-color: var(--sky, #198754); }
.photo-preset:disabled { cursor: not-allowed; opacity: .6; }
.photo-preset img { width: 100%; height: 100%; object-fit: cover; }
.photo-message { margin-top: 14px; }
.member-kicker { margin-bottom: 8px; color: #198754; font-size: 11px; font-weight: 700; letter-spacing: .15em; }
.member-card h1 { margin: 0 0 24px; color: #2c3e50; font-size: 30px; overflow-wrap: anywhere; }
.member-details { margin: 0 0 25px; border-top: 1px solid #e4ebe7; text-align: left; }
.member-details div { display: flex; justify-content: space-between; gap: 12px; padding: 13px 0; border-bottom: 1px solid #e4ebe7; font-size: 13px; }
.member-details dt { color: #71808a; font-weight: 400; }
.member-details dd { margin: 0; color: #2c3e50; font-weight: 700; overflow-wrap: anywhere; }
.member-online { color: #198754 !important; }
.profile-edit-button { width: 100%; margin-bottom: 12px; padding: 12px; color: #198754; background: #fff; border: 1px solid #b9d8c6; border-radius: 5px; cursor: pointer; font-weight: 700; }
.profile-edit-button:hover { color: #fff; background: #198754; }
.profile-form { margin: 0 0 25px; padding: 20px; background: #f7faf8; border: 1px solid #dce8df; border-radius: 8px; text-align: left; }
.profile-form label { display: grid; gap: 6px; margin-bottom: 14px; color: #53636d; font-size: 13px; font-weight: 700; }
.profile-form input { width: 100%; box-sizing: border-box; padding: 10px 11px; color: #2c3e50; background: #fff; border: 1px solid #cbd9d0; border-radius: 5px; font: inherit; }
.profile-form input:focus { outline: 2px solid rgba(25, 135, 84, .2); border-color: #198754; }
.profile-form-actions { display: grid; gap: 8px; }
.profile-save, .profile-cancel { width: 100%; padding: 11px; border-radius: 5px; cursor: pointer; font-weight: 700; }
.profile-save { color: #fff; background: #198754; border: 1px solid #198754; }
.profile-save:disabled { cursor: wait; opacity: .65; }
.profile-cancel { color: #53636d; background: #fff; border: 1px solid #cbd9d0; }
.profile-message { margin: 0 0 14px; font-size: 13px; }
.profile-error { color: #c0392b; }
.profile-success { color: #198754; }
.member-shop { display: block; width: 100%; margin-bottom: 12px; padding: 12px; color: #fff; background: #198754; border-radius: 5px; font-weight: 700; text-decoration: none; }
.member-logout { width: 100%; padding: 12px; color: #c0392b; background: #fff; border: 1px solid #e2b8b2; border-radius: 5px; cursor: pointer; font-weight: 700; }
.member-logout:hover { color: #fff; background: #c0392b; }

/* Skylearn */
:root[data-theme="sky"] .member-page { min-height: calc(100vh - 81px); padding: 48px 20px 96px; background: radial-gradient(circle at 50% 0, var(--sky-soft) 0, transparent 50%); }
:root[data-theme="sky"] .member-card { width: min(100%, 520px); padding: 40px; }
:root[data-theme="sky"] .member-card h1 { margin: 0 0 32px; color: var(--ink); font-size: 36px; }
:root[data-theme="sky"] .member-details { margin-bottom: 28px; border-color: var(--outline); }
:root[data-theme="sky"] .member-details div { align-items: center; padding: 16px 0; border-color: var(--outline); font-size: 16px; }
:root[data-theme="sky"] .member-details dt { color: var(--ink-muted); }
:root[data-theme="sky"] .member-details dd { color: var(--ink); }
:root[data-theme="sky"] .member-online { color: var(--leaf-ink) !important; }
:root[data-theme="sky"] .member-online::before { content: '●'; margin-right: 6px; font-size: 12px; }
:root[data-theme="sky"] .profile-edit-button { color: #fff; border-color: var(--sky); }
:root[data-theme="sky"] .profile-edit-button:hover { color: #fff; background: var(--sky); }
:root[data-theme="sky"] .profile-form { background: var(--sunken); border-color: var(--outline); }
:root[data-theme="sky"] .profile-form label { color: var(--ink-muted); }
:root[data-theme="sky"] .profile-form input { color: var(--ink); border-color: var(--outline); }
:root[data-theme="sky"] .profile-save { background: var(--sky); border-color: var(--sky); }
:root[data-theme="sky"] .profile-cancel { color: #fff; background: var(--sky); border-color: var(--sky); }
:root[data-theme="sky"] .profile-error { color: var(--coral-ink); }
:root[data-theme="sky"] .profile-success { color: var(--leaf-ink); }
:root[data-theme="sky"] .member-shop { margin-bottom: 12px; }
:root[data-theme="sky"] .member-logout:hover { color: var(--coral-ink); background: var(--coral-soft); }
@media (max-width: 480px) {
    :root[data-theme="sky"] .member-card { padding: 28px 20px; }
}
</style>
