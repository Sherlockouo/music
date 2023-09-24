import { FastifyPluginAsync } from 'fastify'
import netease from './netease/netease'
import unblock from './netease/unblock'
import audio from './netease/audio'
import album from './apple-music/album'
import artist from './apple-music/artist'
import checkToken from './apple-music/check-token'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    return 'R3PLAYX server is running!'
  })
  fastify.register(netease)
  fastify.register(unblock)
  fastify.register(audio)
  fastify.register(album)
  fastify.register(artist)
  fastify.register(checkToken)
}

export default root
