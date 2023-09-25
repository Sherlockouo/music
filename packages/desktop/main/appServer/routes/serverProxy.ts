import { FastifyInstance } from 'fastify'
import proxy from '@fastify/http-proxy'
import { isDev } from '@/desktop/main/env'
import log from '@/desktop/main/log'

log.info('[electron] appServer/routes/r3playx/appleMusic.ts')

async function serverProxy(fastify: FastifyInstance) {
  // all the request now is handleing by the server
  fastify.register(proxy, {
    upstream: 'http://127.0.0.1:35530/',
  })
}

export default serverProxy
