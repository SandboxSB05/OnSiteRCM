import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const devProjectsMiddleware = () => ({
  name: 'dev-projects-middleware',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (!req.url || !req.url.startsWith('/api/projects/')) {
        return next()
      }
      
      // Set required environment variables for handler
      process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
      process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
      
      try {
        // Parse query string manually
        const urlParts = req.url.split('?')
        req.query = {}
        if (urlParts[1]) {
          urlParts[1].split('&').forEach((param: string) => {
            const [key, value] = param.split('=')
            req.query[decodeURIComponent(key)] = decodeURIComponent(value || '')
          })
        }
        req.method = req.method || 'GET'
        
        // Create a mock response object that supports both json() and status().json()
        let statusCode = 200
        const mockRes: any = {
          statusCode,
          headers: {} as Record<string, string>,
          status: function(code: number) {
            statusCode = code
            return this
          },
          json: function(data: any) {
            res.statusCode = statusCode
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify(data))
          },
          setHeader: function(key: string, value: string) {
            this.headers[key] = value
            res.setHeader(key, value)
          },
        }
        
        // Dynamically require the handler
        const mod = require('./api/projects/list.ts')
        const handler = mod.default
        await handler(req, mockRes)
      } catch (error) {
        console.error('Projects API error:', error)
        res.statusCode = 500
        res.setHeader('content-type', 'application/json')
        res.end(
          JSON.stringify({
            error: 'Projects request failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        )
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Inject non-VITE_ prefixed env vars into process.env for server-side code
  process.env.SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  process.env.SUPABASE_STORAGE_BUCKET = env.SUPABASE_STORAGE_BUCKET || 'relay_photos'
  
  return {
    plugins: [react(), devProjectsMiddleware()],
    base: "/",
    server: {
      port: 3000,
      allowedHosts: true
    },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  }
}) 
