/* eslint-disable @typescript-eslint */
import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify'
import NeteaseCloudMusicApi, { SoundQualityType } from 'NeteaseCloudMusicApi'
import cache from '../../utils/cache'
import { CacheAPIs } from '@/shared/CacheAPIs'
import log from '../../utils/log'
const match = require('@unblockneteasemusic/server')
// import https from 'https'

function stringifyCookie(cookies: string[]) {
  var result = ''

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i]
    var separatorIndex = cookie.indexOf('=')
    var name = cookie.substring(0, separatorIndex)
    var value = cookie.substring(separatorIndex + 1)
    result += name + '=' + value + '; '
  }

  return result
}

const unblock: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // 劫持网易云的song/url api，将url替换成缓存的音频文件url
  fastify.get(
    '/netease/song/url/v1',
    async (
      req: FastifyRequest<{ Querystring: { id: string | number; level: SoundQualityType } }>,
      reply
    ) => {
      const id = Number(req.query.id) || 0
      if (!id || isNaN(id)) {
        return reply.status(400).send({
          code: 400,
          msg: 'id is required or id is invalid',
        })
      }

      // const cache = await getAudioFromCache(id)
      // if (cache) {
      //   return cache
      // }
      console.log(req.headers.cookies as unknown as any);
      
      const { body: fromNetease }: { body: any } = await NeteaseCloudMusicApi.song_url_v1({
        ...req.query,
        cookie: stringifyCookie(req.headers.cookies as unknown as any),
      })
      if (
        fromNetease?.code === 200 &&
        !fromNetease?.data?.[0]?.freeTrialInfo &&
        fromNetease?.data?.[0]?.url
      ) {
        reply.status(200).send(fromNetease)
        return
      }

      // 是试听歌曲就把url删掉
      if (fromNetease?.data?.[0].freeTrialInfo) {
        fromNetease.data[0].url = ''
      }

      reply.status(fromNetease?.code ?? 500).send(fromNetease)
    }
  )

  // 获取缓存的音频数据
  fastify.get(
    `/r3playx/audio/:filename`,
    (req: FastifyRequest<{ Params: { filename: string } }>, reply) => {
      const filename = req.params.filename
      cache.getAudio(filename, reply)
    }
  )

  // 缓存音频数据
  fastify.post(
    `/r3playx/audio/:id`,
    async (
      req: FastifyRequest<{
        Params: { id: string }
        Querystring: { url: string; bitrate: number }
      }>,
      reply
    ) => {
      const id = Number(req.params.id)
      const { url, bitrate } = req.query
      if (isNaN(id)) {
        return reply.status(400).send({ error: 'Invalid param id' })
      }
      if (!url) {
        return reply.status(400).send({ error: 'Invalid query url' })
      }

      const data = (await (req as any).file()) as any

      if (!data?.file) {
        return reply.status(400).send({ error: 'No file' })
      }

      try {
        await cache.setAudio(await data.toBuffer(), { id, url, bitrate })
        reply.status(200).send('Audio cached!')
      } catch (error) {
        reply.status(500).send({ error })
      }
    }
  )

  fastify.get(
    '/netease/unblock',
    async (
      request: FastifyRequest<{ Querystring: { [key: string]: string } }>,
      reply: FastifyReply
    ) => {
      const trackID = request.query.track_id as string
      console.log('query', trackID)

      const cacheData = await cache.get(CacheAPIs.UNBLOCK,trackID)
      if (cacheData) {
        console.log('get from cache');
        
        return cacheData
      }
      if (!trackID) {
        reply.code(400).send('param invalid: mission track_id')
        return
      }
      log.info("try to match trackid")
      try {
        await match(trackID, ['qq', 'kuwo', 'migu', 'kugou', 'joox']).then((data: unknown) => {
          console.log('unblock data', data)
          if(data === null || data === undefined || (data as any)?.url === ''){
            reply.code(404).send('no such unblock info')
            return 
          }
          
          cache.set(CacheAPIs.UNBLOCK,{id:trackID,url: (data as any)?.url},trackID)
          reply.send(data)
        })
      } catch (err) {
        reply.send(err)
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
