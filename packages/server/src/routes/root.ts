import { FastifyPluginAsync } from 'fastify'
import netease from './netease/netease'
import unblock from './netease/unblock'
const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    return 'R3PLAY server is running!'
  })
  fastify.register(netease)
  fastify.register(unblock)
}

export default root
