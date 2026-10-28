import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchThoughtSpotToken, parseUsername, UsernameRejectedError } from './server/tokenService'

const MAX_BODY_BYTES = 4096

// Dev-only stand-in for the Vercel function at api/ts-token.ts, so `npm run dev`
// serves the same /api/ts-token endpoint with the server-side env vars.
function tsTokenDevApi(env: Record<string, string>): Plugin {
  return {
    name: 'ts-token-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/ts-token', async (req, res) => {
        res.setHeader('Cache-Control', 'no-store')
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        let raw = ''
        for await (const chunk of req) {
          raw += chunk
          if (raw.length > MAX_BODY_BYTES) break
        }
        let username: string | null = null
        try {
          username = parseUsername(JSON.parse(raw)?.username)
        } catch {
          /* invalid JSON — handled as a missing username below */
        }
        if (!username) {
          res.statusCode = 400
          res.end('A valid username is required')
          return
        }
        try {
          const token = await fetchThoughtSpotToken(env, username)
          res.setHeader('Content-Type', 'text/plain')
          res.end(token)
        } catch (err) {
          console.error('[ts-token]', err instanceof Error ? err.message : err)
          if (err instanceof UsernameRejectedError) {
            res.statusCode = 403
            res.end('Username not allowed')
            return
          }
          res.statusCode = 502
          res.end('Unable to obtain ThoughtSpot token')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // '' prefix → load every var (incl. non-public TOKEN_SERVICE_*) for the dev API only.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tsTokenDevApi(env)],
    // Expose NEXT_PUBLIC_THOUGHTSPOT_HOST to the client alongside VITE_* vars.
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    server: {
      port: 3000,
      open: true,
      // Let the ThoughtSpot embed iframe (different origin) fetch a self-hosted
      // brand font referenced via customCSSUrl (/embed-font.css -> /<font>.woff2).
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    preview: {
      headers: { 'Access-Control-Allow-Origin': '*' },
    }
  }
})
