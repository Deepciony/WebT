<template>
  <header v-if="isSky" class="sky-topbar">
    <div class="sky-topbar-inner">
      <router-link to="/" class="sky-brand" :aria-label="t('nav.homeAria')">
        <img class="sky-brand-logo" src="http://localhost:3000/img_pd/LogoSRC.png" alt="KUSHOP">
      </router-link>

      <nav class="sky-nav" :aria-label="t('nav.menu')">
        <router-link v-for="link in visibleLinks" :key="link.to" :to="link.to" class="sky-nav-link">
          <SkyIcon :name="link.icon" :size="22" />
          <span>{{ t(link.label) }}</span>
        </router-link>
        <router-link v-if="authStore.isLogin" to="/pagemember" class="sky-nav-link sky-member">
          <SkyIcon name="user" :size="22" />
          <span>{{ memName }}</span>
        </router-link>
      </nav>

      <AppSwitches class="sky-actions" />
      <router-link v-if="authStore.isLogin" to="/cart" class="sky-cart" :aria-label="t('nav.cartAria', { n: cartCount })">
        <SkyIcon name="cart" :size="24" />
        <span class="sky-cart-label">{{ t('nav.cart') }}</span>
        <span class="sky-cart-badge sk-mono">{{ cartCount }}</span>
      </router-link>
      <button v-if="authStore.isLogin" class="sky-logout" type="button" :aria-label="t('profile.logout')" :title="t('profile.logout')" @click="memLogout">
        <SkyIcon name="logout" :size="24" />
      </button>
    </div>
  </header>

  <nav v-else class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <button
        class="navbar-toggler" type="button" data-bs-toggle="collapse"
        data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/"><div class="nav-link">{{ t('nav.home') }}</div></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/product"><div class="nav-link">{{ t('nav.products') }}</div></router-link>
          </li>
          <li v-if="authStore.isLogin" class="nav-item">
            <router-link to="/manage"><div class="nav-link">{{ t('nav.editData') }}</div></router-link>
          </li>
          <li v-if="authStore.isLogin" class="nav-item">
            <router-link to="/database"><div class="nav-link">{{ t('nav.database') }}</div></router-link>
          </li>
          <li v-if="authStore.isLogin" class="nav-item">
            <router-link to="/cart"><div class="nav-link">{{ t('nav.cart') }} <span class="cart-badge">{{ cartCount }}</span></div></router-link>
          </li>
          <li v-if="authStore.isLogin" class="nav-item">
            <router-link to="/pagemember" style="text-decoration: none"><div class="nav-link fw-bold">{{ memName }}</div></router-link>
          </li>
          <li v-if="authStore.isLogin" class="nav-item">
            <a href="#" style="text-decoration: none" @click.prevent="memLogout"><div class="nav-link fw-bold">{{ t('profile.logout') }}</div></a>
          </li>
          <li v-if="!authStore.isLogin" class="nav-item">
            <router-link to="/login" style="text-decoration: none"><div class="nav-link">{{ t('nav.login') }}</div></router-link>
          </li>
        </ul>
        <AppSwitches class="ms-auto py-2" />
      </div>
    </div>
  </nav>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { cartCount } from '../stores/cart.js'
import { isSky } from '../stores/theme.js'
import { useAuthStore } from '../stores/authStore.js'
import { t } from '../i18n.js'
import SkyIcon from './SkyIcon.vue'
import AppSwitches from './AppSwitches.vue'

const authStore = useAuthStore()
const router = useRouter()
const memName = computed(() => authStore.member?.memName)

const memLogout = async () => {
  await authStore.memLogout()
  router.push('/login')
}

const links = [
  { to: '/', label: 'nav.home', icon: 'home' },
  { to: '/product', label: 'nav.products', icon: 'shop' },
  { to: '/login', label: 'nav.login', icon: 'login', guest: true },
  { to: '/manage', label: 'nav.manage', icon: 'pencil', member: true },
  { to: '/database', label: 'nav.database', icon: 'database', member: true }
]

const visibleLinks = computed(() => links.filter((link) =>
  authStore.isLogin ? !link.guest : !link.member
))
</script>
<style scoped>
.sky-logout { display: grid; flex: none; place-items: center; width: 56px; height: 56px; color: var(--coral-ink); background: var(--surface); border: 1px solid var(--outline); border-radius: 16px; cursor: pointer; transition: background var(--dur), border-color var(--dur); }
.sky-logout:hover { background: var(--coral-soft); border-color: var(--coral); }
.sky-member { max-width: 220px; }
.sky-member span { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.sky-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, .92);
  border-bottom: 1px solid var(--outline);
  backdrop-filter: blur(12px);
}
.sky-topbar-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: none;
  margin: 0 auto;
  padding: 12px clamp(20px, 3vw, 48px);
}
.sky-brand { display: inline-flex; flex: none; align-items: center; gap: 12px; min-height: 56px; color: var(--ink); text-decoration: none; }
.sky-brand-logo { display: block; width: 152px; height: 48px; padding: 0; background: transparent !important; border: 0; border-radius: 0; box-shadow: none !important; object-fit: contain; object-position: left center; }
.sky-brand-name { font-family: var(--font-brand); font-size: 24px; font-weight: 700; letter-spacing: .04em; }
.sky-nav { display: flex; flex: 1; gap: 4px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.sky-nav-link {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding: 0 12px;
  color: var(--ink-muted);
  border-radius: 16px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--dur) var(--ease), color var(--dur);
}
.sky-nav-link:hover { color: var(--ink); background: var(--sunken); }
.sky-nav-link.router-link-exact-active { color: var(--sky-deep); background: var(--sky-soft); }
.sky-actions { flex: none; }
.sky-cart {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding: 0 20px;
  color: #fff;
  background: var(--sky);
  border-radius: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: background var(--dur) var(--ease);
}
.sky-cart:hover, .sky-cart.router-link-exact-active { color: #fff; background: var(--sky-deep); }
.sky-cart-badge {
  display: grid;
  place-items: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  color: var(--sky-deep);
  background: #fff;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
}

@media (min-width: 1381px) and (max-width: 1600px) {
  .sky-nav-link svg { display: none; }
}
@media (max-width: 1380px) {
  .sky-topbar-inner { flex-wrap: wrap; row-gap: 8px; padding: 10px 20px; }
  .sky-actions { margin-left: auto; }
  .sky-nav { order: 3; flex-basis: 100%; overflow-x: auto; scrollbar-width: none; margin: 0 -20px; padding: 0 20px 4px; }
}
@media (max-width: 560px) {
  .sky-topbar { position: static; }
  .sky-brand-name, .sky-cart-label { display: none; }
  .sky-cart { order: 1; margin-left: auto; padding: 0 14px; }
  .sky-logout { order: 1; }
  .sky-actions { order: 2; flex-basis: 100%; margin-left: 0; }
}
</style>
