import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { IncomingMessage, ServerResponse } from 'http'
import { FastifyPluginAsync } from 'fastify'
import log from '@/desktop/main/log'
import cache from '../../../cache'
import request from '../../request'
const match = require('@unblockneteasemusic/server')
const querystring = require('querystring')
import axios from 'axios'
import https from 'https'
import { parse } from 'dotenv'
import { Readable } from 'stream'
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

  fastify.get(
    '/netease/buffer',
    async (
      req: FastifyRequest<{ Querystring: { [key: string]: string } }>,
      reply: FastifyReply
    ) => {
      const parsedURL = new URL(req.query.url)
      console.log('buffer req url', parsedURL.pathname, ' ', req.query.url)

      try {
        const response = await new Promise((resolve, reject) => {
          const options = {
            hostname: parsedURL.hostname,
            path: parsedURL.pathname,
            searchParams: parsedURL.searchParams,
            method: 'GET',
          }

          const request = https.get(options, resolve)

          request.on('error', reject)
        })

        console.log('[unlock][buffer] ', response.body)

        const chunks: string[] = []
        response.setEncoding('base64')
        for await (const chunk of response) {
          chunks.push(chunk)
        }

        const fileBuffer = chunks.join('')

        console.log(response.headers['content-type'])

        // 将音频数据转换为 Base64 编码的字节流
        // const base64Data = fileBuffer.toString('base64')

        // 创建一个可读流，用于将 Base64 编码的字节流发送给前端
        // const readableStream = new Readable()
        // readableStream.push(base64Data)
        // readableStream.push(null) // 结束流

        reply
          .type(response.headers['content-type'])
          .header('Content-Length', fileBuffer.length)
          .send(fileBuffer)
      } catch (error) {
        console.error('请求出错:', error)
        reply.code(500).send(error.toString())
      }
    }
  )
}

export default unblock
