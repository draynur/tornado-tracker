// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  ssr: false, // SPA mode — required for static hosting
  // Set NUXT_APP_BASE_URL env var at build time when deploying to a subpath,
  // e.g. NUXT_APP_BASE_URL=/tornado-tracker/ for github.io/<repo> deployments.
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
  },
})