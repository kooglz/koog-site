import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: ['..'],
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico', 
        'apple-touch-icon.png', 
        'apple-touch-icon-precomposed.png',
        'icons/*.png', 
        'icons/*.ico',
        'logo-animation.mp4',
        'og-share.jpg'
      ],
      manifest: {
        id: 'koogdesign-v1', // PWA唯一ID，更新可强制刷新
        name: 'KOOG DESIGN',
        short_name: 'KOOG',
        description: 'KOOG DESIGN - 创意设计工作室',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/?v=1.1.1', // 版本号参数强制刷新
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cacheId: 'koogdesign-v1.1.1', // 更新版本号强制刷新SW缓存
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true, // 自动清理旧缓存
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,mp4,jpg,jpeg}',
        ],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        runtimeCaching: [
          // Google Fonts CSS (Inter + Noto Sans SC)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Google Fonts 字体文件 (woff2)
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-woff2-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/identity\.netlify\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.cloudfront\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache logo animation video
          {
            urlPattern: /\/logo-animation\.mp4$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'splash-video-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache PWA icons
          {
            urlPattern: /\/icons\//i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'icons-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  base: process.env.GITHUB_PAGES === 'true' ? '/koog-site/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})
