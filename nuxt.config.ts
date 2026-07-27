import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

const isExplicitProdBackend = process.env.NUXT_API_SNAPSHOT === 'false' || process.env.NUXT_API_SNAPSHOT === '0'
const apiSnapshot = !isExplicitProdBackend
/** Каталог nuxt.config (корень репо). `data/*` в Nitro — не от `server/`, иначе server/data/... */
const nuxtProjectRoot = dirname(fileURLToPath(import.meta.url))
const defaultApiSnapshotDataDir = join(nuxtProjectRoot, 'data', 'api-snapshot')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode'
  ],

  components: [
    { path: r('./src/shared/ui'), pathPrefix: false, extensions: ['vue'] },
    { path: r('./src/entities'), pathPrefix: false, extensions: ['vue'] },
    { path: r('./src/features'), pathPrefix: false, extensions: ['vue'] },
    { path: r('./src/widgets'), pathPrefix: false, extensions: ['vue'] }
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' }
      ],
      script: [
        { src: 'https://telegram.org/js/telegram-web-app.js' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  runtimeConfig: {
    /**
     * Прод/локально: NUXT_API_SNAPSHOT=1 + снимок в data/api-snapshot (см. npm run api-snapshot).
     * Проксирование бэка при пустом NUXT_PUBLIC_API_BASE_URL: NUXT_API_BACKEND_URL (по умолч. http://localhost:8000).
     */
    apiSnapshot: apiSnapshot,
    apiBackendUrl: process.env.NUXT_API_BACKEND_URL ?? (process.env.NODE_ENV === 'production' ? 'http://backend:8000' : 'http://localhost:8000'),
    /** Снимок на диске. По умолчанию <root>/data/api-snapshot (не process.cwd() — в IDE CWD бывает неверный). */
    apiSnapshotDataDir: process.env.API_SNAPSHOT_DATA_DIR || defaultApiSnapshotDataDir,
    public: {
      /**
       * Снимок API: пусто → same-origin /api/v2/… (Nitro отдаёт JSON).
       * Иначе в проде по умолчанию прямой URL бэка; `NUXT_PUBLIC_API_BASE_URL=https://api.example.com` — типичный вариант без снимка.
       */
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'https://api.pazl-ai.com',
      apiVersion: process.env.NUXT_PUBLIC_API_VERSION ?? 'v2',
      /** Optional Django REST `Token …` value for authenticated catalog requests. */
      apiToken: process.env.NUXT_PUBLIC_API_TOKEN ?? '',
      /** R2 CDN origin for media files (rewrites /media/… URLs). */
      mediaBaseUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_URL ?? '',
      /** Включение демо-кнопок быстрого входа без пароля (по умолчанию включено) */
      enableDemoLogin: process.env.NUXT_PUBLIC_ENABLE_DEMO_LOGIN !== 'false'
    }
  },

  alias: {
    '@fsd': fileURLToPath(new URL('./src', import.meta.url))
  },

  // Prevents duplicate Nitro auto-import of `useAppConfig` (nitropack vs @nuxt/nitro-server).
  // https://github.com/nuxt/nuxt/issues/34812
  experimental: {
    serverAppConfig: false
  },

  compatibilityDate: '2025-01-15',

  /**
   * GET /api/v2/** — server/routes. При NUXT_API_SNAPSHOT=1 devProxy отключён, иначе /api
   * уходил на 8000 и обходил снимок.
   */
  nitro: {
    ...(!apiSnapshot
      ? {
          devProxy: {
            '/api': {
              target: process.env.NUXT_API_BACKEND_URL ?? 'http://localhost:8000',
              changeOrigin: true
            }
          }
        }
      : {}),
    serverAssets: [{ baseName: 'api-snapshot', dir: defaultApiSnapshotDataDir }]
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    langDir: '../locales',
    locales: [
      { code: 'kk', language: 'kk-KZ', name: 'Қазақша', file: 'kk.json' },
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  pinia: {
    storesDirs: ['./app/stores']
  },

  vite: {
    server: {
      hmr: {
        overlay: false
      }
    }
  }
})
