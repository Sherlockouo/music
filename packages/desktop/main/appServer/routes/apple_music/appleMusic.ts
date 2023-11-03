import { FastifyInstance } from 'fastify'
import proxy from '@fastify/http-proxy'
import { isDev } from '@/desktop/main/env'
import log from '@/desktop/main/log'

log.info('[electron] appServer/routes/r3play/appleMusic.ts')

async function appleMusic(fastify: FastifyInstance) {
  // this means server is published on the cloud
  fastify.register(proxy, {
    upstream: isDev ? 'http://127.0.0.1:35530/' : 'https://music-server.xtify.top/',
    prefix: '/r3playx/apple-music',
    rewritePrefix: '/r3playx/apple-music',
  })
}

export default appleMusic
