import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { IncomingMessage, ServerResponse } from 'http'
import { FastifyPluginAsync } from 'fastify'
import log from '@/desktop/main/log'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import cache from '../../../cache'

const match = require('@unblockneteasemusic/server')
const querystring = require('querystring')

const isDev = false // 这里需要根据实际情况设置是否为开发环境
const port = isDev ? 10660 : 30003

const unblock: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get(
    '/netease/unblock',
    async (
      request: FastifyRequest<{ Querystring: { [key: string]: string } }>,
      reply: FastifyReply
    ) => {
      const trackID = request.query.track_id as string
      console.log('query', trackID)

      const cacheData = await cache.get('unblock', trackID)
      if (cacheData) {
        return cacheData
      }
      if (!trackID) {
        reply.code(400).send('param invalid: mission track_id')
        return
      }

      try {
        console.log('try to req')

        const unlockResponse = await match(trackID, ['qq', 'kuwo', 'migu', 'kugou', 'joox']).then(
          data => {
            console.log('unblock data', data)
            cache.set('unblock', data, trackID)
            reply.send(data)
          }
        )
      } catch (err) {
        reply.send(err.toString())
      }
    }
  )
}

export default unblock
