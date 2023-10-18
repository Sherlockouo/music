import { css, cx } from '@emotion/css'
import { createPortal } from 'react-dom'
import useMV, { useMVUrl, useVideo, useVideoUrl } from '../../api/hooks/useMV'
import { AnimatePresence, motion } from 'framer-motion'
import { ease } from '@/web/utils/const'
import Icon from '../Icon'
import VideoInstance from './VideoInstance'
import { toHttps } from '@/web/utils/common'
import uiStates, { closeVideoPlayer } from '@/web/states/uiStates'
import { useSnapshot } from 'valtio'
import { useNavigate } from 'react-router-dom'
import { FetchMVUrlResponse, FetchMVResponse } from '@/shared/api/MV'

const VideoPlayer = () => {
  const { playingVideoID } = useSnapshot(uiStates)
  const { fullscreen } = useSnapshot(uiStates)
  const navigate = useNavigate()
  const isNumber = (str: string) => {
    return !isNaN(Number(str))
  }
  // for MV
  let mv: FetchMVResponse | undefined = {
    code: 0,
    loadingPic: '',
    bufferPic: '',
    loadingPicFS: '',
    bufferPicFS: '',
    data: {
      artistId: 0,
      artistName: '',
      artists: [],
      briefDesc: '',
      brs: [],
      commentCount: 0,
      commentThreadId: '',
      cover: '',
      coverId: 0,
      coverId_str: '',
      desc: '',
      duration: 0,
      id: 0,
      nType: 0,
      name: '',
      playCount: 0,
      price: undefined,
      publishTime: '',
      shareCount: 0,
      subCount: 0,
      videoGroup: [],
    },
    mp: {
      cp: 0,
      dl: 0,
      fee: 0,
      id: 0,
      msg: null,
      mvFee: 0,
      normal: false,
      payed: 0,
      pl: 0,
      sid: 0,
      st: 0,
      unauthorized: false,
    },
  }
  let isLoading: boolean

  let mvDetails: FetchMVUrlResponse = {
    code: 0,
    data: {
      url: '',
      code: 0,
      expi: 0,
      fee: 0,
      id: 0,
      md5: '',
      msg: '',
      mvFee: 0,
      promotionVo: undefined,
      r: 0,
      size: 0,
      st: 0,
    },
  }

  if (!isNumber(playingVideoID as string)) {
    const videoResponse = useVideo({ id: playingVideoID || '' })
    // console.log('video response',videoResponse);
    mv.data.cover = videoResponse.data?.data.coverUrl as string
    mv.data.artistName = videoResponse.data?.data.creator.nickname as string
    mv.data.name = videoResponse.data?.data.title as string
    const res = useVideoUrl({ id: playingVideoID || '' })
    console.log('video url respones', res)

    isLoading = res.isLoading
    mvDetails.data.url = res.data?.urls[0].url as string
  } else {
    const mvResponse = useMV({ mvid: Number(playingVideoID) || 0 })
    mv = mvResponse.data
    isLoading = mvResponse.isLoading
    const res = useMVUrl({ id: Number(playingVideoID) || 0 })
    mvDetails.data.url = res.data?.data.url as string
  }
  const mvUrl = toHttps(mvDetails?.data?.url)
  const poster = toHttps(mv?.data.cover)

  return createPortal(
    <AnimatePresence>
      {playingVideoID && (
        <div
          id='video-player'
          className={cx(
            'fixed inset-0 z-20 flex select-none items-center justify-center overflow-hidden',
            window.env?.isElectron && !fullscreen && 'rounded-12'
          )}
        >
          {/* Blur bg */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease, duration: 0.5 }}
            className='absolute inset-0 bg-gray-50/80 backdrop-blur-3xl'
          ></motion.div>

          <motion.div
            variants={{
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.3,
                  ease,
                  delay: 0.2,
                },
              },
              hidden: {
                opacity: 0,
                y: 100,
                transition: {
                  duration: 0.3,
                  ease,
                },
              },
            }}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='relative'
          >
            {/* Video Title */}
            <div className='absolute -top-16 flex cursor-default text-32 font-medium text-white transition-all'>
              {isLoading ? (
                <span className='rounded-full bg-white/10 text-transparent'>PLACEHOLDER2023</span>
              ) : (
                <>
                  <div className='line-clamp-1' title={mv?.data.artistName + ' - ' + mv?.data.name}>
                    <a
                      onClick={() => {
                        if (!mv?.data.artistId) return
                        closeVideoPlayer()
                        navigate('/artist/' + mv.data.artistId)
                      }}
                      className='transition duration-400 hover:underline'
                    >
                      {mv?.data.artistName}
                    </a>{' '}
                    - {mv?.data.name}
                  </div>
                  <div className='ml-4 text-white/20'>{mv?.data.publishTime.slice(0, 4)}</div>
                </>
              )}
            </div>

            {/* Video */}
            <VideoInstance src={mvUrl} poster={poster} />

            {/* Close button */}
            <div className='absolute -bottom-24 flex w-full justify-center'>
              <motion.div
                layout='position'
                transition={{ ease }}
                onClick={() => {
                  const video = document.querySelector('#video-player video') as HTMLVideoElement
                  video?.pause()
                  closeVideoPlayer()
                }}
                className='flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/50 transition-colors duration-300 hover:bg-white/20 hover:text-white/70'
              >
                <Icon name='x' className='h-6 w-6' />
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default VideoPlayer
