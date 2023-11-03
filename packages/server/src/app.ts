import { join } from 'path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync } from 'fastify'
import fastifyCookie from '@fastify/cookie'

const app: FastifyPluginAsync<AutoloadPluginOptions> = async (fastify, opts) => {
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  })

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  })
  fastify.register(fastifyCookie)
}

export default app
export { app }
