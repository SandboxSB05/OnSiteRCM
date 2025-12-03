import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const devApiMiddleware = () => ({
  name: 'dev-api-middleware',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (!req.url || (!req.url.startsWith('/api/projects/') && !req.url.startsWith('/api/auth/') && !req.url.startsWith('/api/crew-leads/'))) {
        return next()
      }
      
      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
      
      // Handle preflight OPTIONS requests
      if (req.method === 'OPTIONS') {
        return res.writeHead(200).end();
      }
      
      // Set required environment variables for handler
      // These should come from .env or .env.local files
      process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
      process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
      process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
      process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
      
      // Debug logging
      if (req.url.startsWith('/api/auth/')) {
        console.log('[Middleware Debug] Auth endpoint called:', req.url)
        console.log('[Middleware Debug] VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓' : '✗')
        console.log('[Middleware Debug] VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? `✓ (${process.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...)` : '✗')
        console.log('[Middleware Debug] SUPABASE_URL:', process.env.SUPABASE_URL ? '✓' : '✗')
        console.log('[Middleware Debug] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗')
      }
      
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
        
        // Parse body for POST requests
        if (req.method === 'POST' || req.method === 'PUT') {
          await new Promise((resolve, reject) => {
            let body = ''
            req.on('data', (chunk: any) => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                req.body = body ? JSON.parse(body) : {}
                resolve(undefined)
              } catch (e) {
                reject(e)
              }
            })
            req.on('error', reject)
          })
        }
        
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
        
        // Determine which handler to use
        let handler
        if (req.url.startsWith('/api/projects/')) {
          const mod = require('./api/projects/list.ts')
          handler = mod.default
        } else if (req.url.startsWith('/api/auth/login')) {
          const mod = require('./api/auth/login.ts')
          handler = mod.default
        } else if (req.url.startsWith('/api/auth/register')) {
          const mod = require('./api/auth/register.ts')
          handler = mod.default
        } else if (req.url.startsWith('/api/auth/crew-lead-signup')) {
          const mod = require('./api/auth/crew-lead-signup.ts')
          handler = mod.default
        } else if (req.url.startsWith('/api/crew-leads/invite')) {
          const mod = require('./api/crew-leads/invite.js')
          handler = mod.default
        } else if (req.url.startsWith('/api/crew-leads/list')) {
          const mod = require('./api/crew-leads/list.js')
          handler = mod.default
        } else if (req.url.startsWith('/api/crew-leads/delete')) {
          const mod = require('./api/crew-leads/delete.js')
          handler = mod.default
        }
        
        if (handler) {
          await handler(req, mockRes)
        } else {
          res.statusCode = 404
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'Handler not found' }))
        }
      } catch (error) {
        console.error('API error:', error)
        res.statusCode = 500
        res.setHeader('content-type', 'application/json')
        res.end(
          JSON.stringify({
            error: 'Request failed',
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
  process.env.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY
  process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  process.env.SUPABASE_JWT_SECRET = env.SUPABASE_JWT_SECRET
  process.env.SUPABASE_STORAGE_BUCKET = env.SUPABASE_STORAGE_BUCKET || 'relay_photos'
  
  console.log('📦 [Vite Config] Environment variables loaded:');
  console.log('  - SUPABASE_URL:', process.env.SUPABASE_URL ? '✓' : '✗');
  console.log('  - SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓' : '✗');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  console.log('  - SUPABASE_JWT_SECRET:', process.env.SUPABASE_JWT_SECRET ? '✓' : '✗');
  
  return {
    plugins: [react(), devApiMiddleware()],
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
