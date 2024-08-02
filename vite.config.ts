import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { flatRoutes } from 'remix-flat-routes'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

installGlobals()

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_throwAbortReason: true
      },
      appDirectory: 'app',
      ignoredRouteFiles: ['**/.*.css'],
      serverModuleFormat: 'esm',
      routes: async defineRoutes => {
        return flatRoutes('routes', defineRoutes, { appDir: 'app' })
      }
    }),
    tsconfigPaths()
  ]
})
