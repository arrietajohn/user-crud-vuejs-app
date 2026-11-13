<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { House, Users, UserPlus, Pencil, Trash2, LogOut, Hexagon, ArrowUpRight, ShieldCheck } from 'lucide-vue-next';
import { useApplication, roleLabel } from './context';
const route = useRoute(); const router = useRouter(); const app = useApplication();
const session = computed(() => { void route.fullPath; return app.currentSession(); });
const nav = [ { to: '/', label: 'Inicio', icon: House }, { to: '/usuarios/crear', label: 'Crear usuario', icon: UserPlus }, { to: '/usuarios', label: 'Listar usuarios', icon: Users }, { to: '/usuarios/editar', label: 'Editar usuario', icon: Pencil }, { to: '/usuarios/eliminar', label: 'Eliminar usuario', icon: Trash2 } ];
function logout() { app.logout(); void router.replace('/login'); }
</script>
<template>
  <div v-if="!route.meta.public" class="workspace">
    <aside class="sidebar">
      <RouterLink to="/" class="brand"><Hexagon :size="30" stroke-width="2.3"/> nexo<span class="brand-dot">.</span></RouterLink>
      <div class="workspace-label">ESPACIO DE TRABAJO</div>
      <div class="workspace-name"><span class="workspace-avatar">N</span><div>Administración<small>Gestión de usuarios</small></div></div>
      <div class="nav-label">PRINCIPAL</div>
      <nav><RouterLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ selected: route.path === item.to }"><component :is="item.icon" :size="19"/>{{ item.label }}<span v-if="route.path === item.to" class="nav-indicator"/></RouterLink></nav>
      <div class="sidebar-bottom"><div class="security-note"><ShieldCheck :size="20"/><div>Tu espacio, protegido<small>Acceso seguro a tu equipo</small></div></div><button class="logout" @click="logout"><LogOut :size="18"/>Cerrar sesión<ArrowUpRight :size="16"/></button></div>
    </aside>
    <div class="main-area"><header class="topbar"><span>Espacio de trabajo <span class="breadcrumb">/</span> <strong>Usuarios</strong></span><div class="profile"><span class="online-dot"/> Sesión iniciada <div class="profile-avatar">{{ session?.role === 'ADMIN' ? 'AD' : 'US' }}</div><div class="profile-name">{{ roleLabel[session?.role || ''] || 'Usuario' }}<small>Cuenta personal</small></div></div></header><main><RouterView :key="route.fullPath"/></main><footer>Nexo · Administración de usuarios<span>Un equipo conectado empieza aquí.</span></footer></div>
  </div>
  <RouterView v-else :key="route.path"/>
</template>
