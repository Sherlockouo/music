import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import NeteaseCloudMusicApi, { SoundQualityType } from 'NeteaseCloudMusicApi'
import { app } from 'electron'
import log from '@/desktop/main/log'
import { appName } from '@/desktop/main/env'
import cache from '@/desktop/main/cache'
import fs from 'fs'
import youtube from '@/desktop/main/youtube'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { FetchTracksResponse } from '@/shared/api/Track'
import store from '@/desktop/main/store'
import { db, Tables } from '@/desktop/main/db'
const match = require('@unblockneteasemusic/server')
const dotenv = require('dotenv')

log.info('[electron] appServer/routes/r3play/audio.ts')

const getAudioFromCache = async (id: number) => {
  // get from cache
  const cache = await db.find(Tables.Audio, id)
  if (!cache) return

  const audioFileName = `${cache.id}-${cache.bitRate}.${cache.format}`

  const isAudioFileExists = fs.existsSync(`${app.getPath('userData')}/audio_cache/${audioFileName}`)
  if (!isAudioFileExists) return

  log.debug(`[server] Audio cache hit ${id}`)

  return {
    data: [
      {
        source: cache.source,
        id: cache.id,
        url: `http://127.0.0.1:${
          process.env.ELECTRON_WEB_SERVER_PORT
        }/${appName.toLowerCase()}/audio/${audioFileName}`,
        br: cache.bitRate,
        size: 0,
        md5: '',
        code: 200,
        expi: 0,
        type: cache.format,
        gain: 0,
        fee: 8,
        uf: null,
        payed: 0,
        flag: 4,
        canExtend: false,
        freeTrialInfo: null,
        level: 'standard',
        encodeType: cache.format,
        freeTrialPrivilege: {
          resConsumable: false,
          userConsumable: false,
          listenType: null,
        },
        freeTimeTrialPrivilege: {
          resConsumable: false,
          userConsumable: false,
          type: 0,
          remainTime: 0,
        },
        urlSource: 0,
      },
    ],
    code: 200,
  }
}

const getAudioFromYouTube = async (id: number) => {
  let fetchTrackResult: FetchTracksResponse | undefined = await cache.get(CacheAPIs.Track, {
    ids: String(id),
  })
  if (!fetchTrackResult) {
    log.info(`[audio] getAudioFromYouTube no fetchTrackResult, fetch from netease api`)
    fetchTrackResult = (await NeteaseCloudMusicApi.song_detail({
      ids: String(id),
    })) as unknown as FetchTracksResponse
  }
  const track = fetchTrackResult?.songs?.[0]
  if (!track) return

  try {
    const data = await youtube.matchTrack(track.ar[0].name, track.name)
    if (!data) return
    return {
      data: [
        {
          source: 'youtube',
          id,
          url: data.url,
          br: data.bitRate,
          size: 0,
          md5: '',
          code: 200,
          expi: 0,
          type: 'opus',
          gain: 0,
          fee: 8,
          uf: null,
          payed: 0,
          flag: 4,
          canExtend: false,
          freeTrialInfo: null,
          level: 'standard',
          encodeType: 'opus',
          freeTrialPrivilege: {
            resConsumable: false,
            userConsumable: false,
            listenType: null,
          },
          freeTimeTrialPrivilege: {
            resConsumable: false,
            userConsumable: false,
            type: 0,
            remainTime: 0,
          },
          urlSource: 0,
          r3play: {
            youtube: data,
          },
        },
      ],
      code: 200,
    }
  } catch (e) {
    log.error('getAudioFromYouTube error', id, e)
  }
}

const getTrackInfo = async (id: number): Promise<Track | undefined> => {
  let fetchTrackResult: FetchTracksResponse | undefined = await cache.get(CacheAPIs.Track, {
    ids: String(id),
  })
  if (!fetchTrackResult) {
    log.info(`[audio] getAudioFromYouTube no fetchTrackResult, fetch from netease api `)
    fetchTrackResult = (await NeteaseCloudMusicApi.song_detail({
      ids: String(id),
    })) as unknown as FetchTracksResponse
  }
  const track = fetchTrackResult?.songs?.[0]
  if (!track) return
  return track
}
async function audio(fastify: FastifyInstance) {
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

      // const res = getAudioFromYouTube(id)
      // console.log('youtube ',res);

      const localCache = await getAudioFromCache(id)
      if (localCache) {
        return localCache
      }

      const { body: fromNetease }: { body: any } = await NeteaseCloudMusicApi.song_url_v1({
        ...req.query,
        cookie: req.cookies as unknown as any,
      })

      if (
        fromNetease?.code === 200 &&
        !fromNetease?.data?.[0]?.freeTrialInfo &&
        fromNetease?.data?.[0]?.url
      ) {
        reply.status(200).send(fromNetease)
        return
      }
      // console.log(fromNetease);

      const trackID = id
      // 先查缓存
      const cacheData = await cache.get(CacheAPIs.Unblock, trackID)
      if (cacheData) {
        return cacheData
      }
      if (!trackID) {
        reply.code(400).send({
          code: 400,
          msg: 'id is required or id is invalid',
        })
        return
      }
      // 从存储中获取环境变量的值
      const qqCookie = store.get('settings.qqCookie')
      const miguCookie = store.get('settings.miguCookie')
      const jooxCookie = store.get('settings.jooxCookie')

      process.env.QQ_COOKIE = (qqCookie as string) || ''
      process.env.MIGU_COOKIE = (miguCookie as string) || ''
      process.env.JOOX_COOKIE = (jooxCookie as string) || ''
      process.env.ENABLE_FLAC = 'true'
      process.env.ENABLE_LOCAL_VIP = 'true'
      // // 动态生成 `.env` 文件的内容
      // const envConfig = `
      //   QQ_COOKIE=${qqCookie}
      //   MIGU_COOKIE=${miguCookie}
      //   JOOX_COOKIE=${jooxCookie}
      //   ENABLE_FLAC=true
      //   ENABLE_LOCAL_VIP=true
      // `
      // // 加载动态的环境变量
      // dotenv.config({ path: envConfig })
      const isEnglish = /^[a-zA-Z\s]+$/
      let source = ['qq', 'migu', 'joox', 'youtube']
      // let source = ['qq']
      const enableFindTrackOnYouTube = store.get('settings.enableFindTrackOnYouTube')
      const httpProxyForYouTubeSettings = store.get('settings.httpProxyForYouTube')
      if (enableFindTrackOnYouTube && httpProxyForYouTubeSettings) {
        const youtubeProxy = (httpProxyForYouTubeSettings as any).proxy as string
        ;(global as any).proxy = require('url').parse(youtubeProxy)
        const info = await getTrackInfo(trackID)
        const artistName =
          info?.ar[0]?.name === undefined ? '' : info?.ar[0]?.name.replace(/[^a-zA-Z\s]/g, '')
        const songName = info?.name === undefined ? '' : info?.name.replace(/[^a-zA-Z\s]/g, '')

        if (isEnglish.test(artistName) && isEnglish.test(songName)) {
          source = ['youtube', 'qq', 'migu']
        }
      }
      try {
        // todo: 暂时写死的，是否开放给用户配置
        await match(trackID, source).then((data: unknown) => {
          // await match(trackID, ['youtube']).then((data: unknown) => {
          if (data === null || data === undefined || (data as any)?.url === '') {
            reply.code(500).send({
              code: 400,
              msg: 'no track info',
            })
            return
          }

          cache.set(CacheAPIs.Unblock, { id: trackID, url: (data as any)?.url }, trackID)
          reply.code(200).send({
            code: 200,
            data: [data],
          })
        })
      } catch (err) {
        reply.code(500).send(err)
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
    `/${appName.toLowerCase()}/audio/:filename`,
    (req: FastifyRequest<{ Params: { filename: string } }>, reply) => {
      const filename = req.params.filename
      cache.getAudio(filename, reply)
    }
  )

  // 缓存音频数据
  fastify.post(
    `/${appName.toLowerCase()}/audio/:id`,
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

      const data = await req.file()

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
}

export default audio
