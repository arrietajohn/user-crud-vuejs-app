<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Hexagon, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-vue-next';
import { useApplication, errorMessage } from '../context';
const app = useApplication(); const router = useRouter(); const route = useRoute();
const email = ref(''); const password = ref(''); const show = ref(false); const busy = ref(false); const error = ref('');
async function submit() {
  busy.value = true; error.value = '';
  try {
    await app.login({ email: email.value, password: password.value });
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//') ? route.query.redirect : '/';
    await router.replace(redirect);
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>
<template>
  <div class="auth-layout"><section class="auth-story"><RouterLink to="/login" class="brand"><Hexagon :size="32"/> nexo.</RouterLink><div class="story-content"><span class="eyebrow light">PERSONAS QUE CONECTAN</span><h1>Tu equipo.<br>Un solo lugar.<br><em>Más posibilidades.</em></h1><p>Un espacio simple y seguro para administrar a las personas que hacen posible tu organización.</p><div class="story-circles"><span>JA</span><span>MC</span><span>LV</span><div>Todo tu equipo,<br><strong>mejor conectado.</strong></div></div></div><span class="story-footer"><ShieldCheck :size="17"/> Diseñado para trabajar con confianza</span></section>
  <section class="auth-form-area"><div class="auth-card"><span class="eyebrow">BIENVENIDO A NEXO</span><h2>Qué bueno verte de nuevo.</h2><p class="muted">Inicia sesión para entrar a tu espacio de trabajo.</p>
    <div v-if="route.query.expired" class="notice" role="alert">Tu sesión venció. Inicia sesión nuevamente.</div>
    <div v-if="error" class="error" role="alert">{{ error }}</div>
    <form @submit.prevent="submit"><label for="email">Correo electrónico</label><input id="email" v-model="email" type="email" autocomplete="username" placeholder="tu@organizacion.com" required/><label for="password">Contraseña</label><div class="password-field"><input id="password" v-model="password" :type="show ? 'text' : 'password'" autocomplete="current-password" placeholder="Ingresa tu contraseña" required/><button type="button" :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="show = !show"><component :is="show ? EyeOff : Eye" :size="18"/></button></div><button class="button primary full" :disabled="busy">{{ busy ? 'Iniciando sesión…' : 'Iniciar sesión' }}<ArrowRight :size="18"/></button></form>
    <div class="auth-register">¿Aún no tienes una cuenta? <RouterLink to="/registro">Crear usuario ↗</RouterLink></div><div class="auth-security"><ShieldCheck :size="16"/> Tu información viaja de forma segura.</div>
  </div><span class="auth-copyright">© {{ new Date().getFullYear() }} Nexo. Hecho para conectar.</span></section></div>
</template>
