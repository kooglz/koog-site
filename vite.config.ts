import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// Vite's SPA fallback otherwise serves the portfolio at /admin/ during local editing.
const adminEntry = (): Plugin => {
  const install = (server: { middlewares: { use: (handler: (req: { url?: string }, res: { writeHead: (status: number, headers: Record<string, string>) => void; end: () => void }, next: () => void) => void) => void } }) => {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/admin') { res.writeHead(302, { Location: '/admin/' }); res.end(); return; }
      if (req.url?.split('?')[0] === '/admin/') req.url = req.url.replace('/admin/', '/admin/index.html');
      next();
    });
  };
  return { name: 'local-admin-entry', configureServer: install, configurePreviewServer: install };
};

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8081',
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
    adminEntry(),
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
        id: 'koogdesign-v1', // 保留已安装 PWA 的稳定身份
        name: 'KOOG DESIGN',
        short_name: 'KOOG',
        description: 'KOOG DESIGN - 创意设计工作室',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/?v=1.1.1', // 已安装 PWA 的稳定启动入口，普通发布不修改
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
        importScripts: process.env.NODE_ENV === 'production' ? ['sw-upgrade.js'] : [],
        navigateFallbackDenylist: [/\/admin(?:\/|$)/],
        globIgnores: ['**/admin/**'],
        cacheId: 'koogdesign-v1.1.1', // 复用现有缓存，普通发布只按文件 revision 更新
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true, // 自动清理旧缓存
        // Artwork URLs use stable ?v=content-hash values. Reuse the same revisioned
        // precache as the original URLs instead of downloading every image twice.
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/],
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,mp4,jpg,jpeg,webp,gif}',
        ],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        runtimeCaching: [
          { urlPattern: /\/admin\//, handler: 'NetworkOnly' },
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
            // Match pathname: testing the complete URL misses ?v=... uploads.
            urlPattern: ({ url }) => /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname),
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
            urlPattern: ({ url }) => /\.(?:js|css)$/i.test(url.pathname),
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
