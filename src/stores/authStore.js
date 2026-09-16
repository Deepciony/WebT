import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const isLogin = ref(false)
    const member = ref(null)
    const checked = ref(false)

    const login = () => {
        isLogin.value = true
    }

    const logout = () => {
        isLogin.value = false
        member.value = null
    }

    // Ask the API to decode the httpOnly token cookie
    const getMember = async () => {
        try {
            const res = await axios.get('http://localhost:3000/members/detail')
            isLogin.value = Boolean(res.data.login)
            member.value = res.data.login ? res.data : null
        } catch (err) {
            console.log(err.message)
            logout()
        }
        checked.value = true
    }

    // Clears the httpOnly cookie on the server, then the local state
    const memLogout = async () => {
        try {
            await axios.get('http://localhost:3000/members/logout')
        } catch (err) {
            console.log(err.message)
        }
        logout()
    }

    // Dev-only: pretend to be signed in when no API/DB is running
    const fakeLogin = () => {
        member.value = { memEmail: 'dev@localhost', memName: 'Dev', dutyId: 'member', login: true }
        isLogin.value = true
        checked.value = true
    }

    return { isLogin, member, checked, login, logout, getMember, memLogout, fakeLogin }
})
