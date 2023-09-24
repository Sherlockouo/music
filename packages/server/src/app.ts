import { join } from 'path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync } from 'fastify'
import { dirname } from './utils/utils'

const app: FastifyPluginAsync<AutoloadPluginOptions> = async (fastify, opts) => {
  fastify.register(AutoLoad, {
    dir: join(dirname, 'plugins'),
    options: opts,
  }
)

  fastify.register(AutoLoad, {
    dir: join(dirname, 'routes'),
    options: opts,
  })
}

export default app
export { app }
