/* eslint-disable @typescript-eslint */
import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify'
import log from '../../utils/log'
import cache from '../../utils/cache'
import { CacheAPIs } from '../../../../shared/CacheAPIs'
const match = require('@unblockneteasemusic/server')

const unblock: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get(
    '/netease/unblock',
    async (
      request: FastifyRequest<{ Querystring: { [key: string]: string } }>,
      reply: FastifyReply
    ) => {
      const trackID = request.query.track_id as string
      log.info('query', trackID)

      const cacheData = await cache.get(CacheAPIs.Unblock, trackID)
      if (cacheData) {
        log.info('hit cache trackID: ', trackID)
        return cacheData
      }
      if (!trackID) {
        reply.code(400).send('param invalid: missing track_id')
        return
      }

      try {
        await match(trackID, ['qq', 'kuwo', 'migu', 'kugou', 'joox']).then((data: unknown) => {
          if (data === null || data === undefined || (data as any)?.url === '') {
            reply.code(500).send('no track info, something bad happens')
            return
          }

          cache.set(CacheAPIs.Unblock, { id: trackID, url: (data as any)?.url }, trackID)
          log.info('[server] unblock track ', trackID, ' success')
          reply.code(200).send(data)
        })
      } catch (err) {
        reply.code(500).send(err)
      }
    }
  )

  // fastify.get(
  //   '/netease/buffer',
  //   async (
  //     req: FastifyRequest<{ Querystring: { [key: string]: string } }>,
  //     reply: FastifyReply
  //   ) => {
  //     const parsedURL = new URL(req.query.url)
  //     console.log('buffer req url', parsedURL.pathname, ' ', req.query.url)

  //     try {
  //       const response = await new Promise((resolve, reject) => {
  //         const options = {
  //           hostname: parsedURL.hostname,
  //           path: parsedURL.pathname,
  //           searchParams: parsedURL.searchParams,
  //           method: 'GET',
  //         }

  //         const request = https.get(options, resolve)

  //         request.on('error', reject)
  //       })

  //       console.log('[unlock][buffer] ', response.body)

  //       const chunks: string[] = []
  //       response.setEncoding('base64')
  //       for await (const chunk of response) {
  //         chunks.push(chunk)
  //       }

  //       const fileBuffer = chunks.join('')

  //       console.log(response.headers['content-type'])

  //       // 将音频数据转换为 Base64 编码的字节流
  //       // const base64Data = fileBuffer.toString('base64')

  //       // 创建一个可读流，用于将 Base64 编码的字节流发送给前端
  //       // const readableStream = new Readable()
  //       // readableStream.push(base64Data)
  //       // readableStream.push(null) // 结束流

  //       reply
  //         .type(response.headers['content-type'])
  //         .header('Content-Length', fileBuffer.length)
  //         .send(fileBuffer)
  //     } catch (error) {
  //       console.error('请求出错:', error)
  //       reply.code(500).send(error.toString())
  //     }
  //   }
  // )
}

export default unblock
