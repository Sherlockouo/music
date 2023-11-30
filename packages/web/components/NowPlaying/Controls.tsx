import persistedUiStates from '@/web/states/persistedUiStates'
import player from '@/web/states/player'
import { cx, css } from '@emotion/css'
import { MotionConfig, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'
import Icon from '../Icon'
import { State as PlayerState } from '@/web/utils/player'
import useUserLikedTracksIDs, { useMutationLikeATrack } from '@/web/api/hooks/useUserLikedTracksIDs'
import Slider from '@/web/components/Slider'
import { ceil } from 'lodash'
import { ease } from '@/web/utils/const'
import { useTranslation } from 'react-i18next'
import AudioOutputDevices from '@/web/components/Tools/Devices'
import { useState } from 'react'
import { IpcChannels } from '@/shared/IpcChannels'
import settings from '@/web/states/settings'
const LikeButton = () => {
  const { track } = useSnapshot(player)
  const { data: likedIDs } = useUserLikedTracksIDs()
  const isLiked = !!likedIDs?.ids?.find(id => id === track?.id)
  const likeATrack = useMutationLikeATrack()
  const { minimizePlayer: mini } = useSnapshot(persistedUiStates)

  return (
    <motion.button
      layout='position'
      animate={{ rotate: mini ? 90 : 0 }}
      onClick={() => track?.id && likeATrack.mutateAsync(track.id)}
      className='text-black/90 transition-colors duration-400 dark:text-white/40 hover:dark:text-white/90'
    >
      <Icon name={isLiked ? 'heart' : 'heart-outline'} className={cx('h-7 w-7', 'text-center')} />
    </motion.button>
  )
}

const Controls = () => {
  
  const { state, track } = useSnapshot(player)
  const { minimizePlayer: mini } = useSnapshot(persistedUiStates)
  const { showDeskttopLyrics, showDevices } = useSnapshot(persistedUiStates)

  return (
    <MotionConfig transition={{ ease, duration: 0.5 }}>
      <motion.div
        className={cx(
          'fixed bottom-0 right-0 flex',
          mini ? 'flex-col items-center justify-between' : 'items-center justify-between',
          mini
            ? css`
                right: 24px;
                bottom: 18px;
                width: 44px;
                height: 254px;
                text-align: center;
              `
            : css`
                justify-content: space-around;
                bottom: 56px;
                right: 56px;
                width: 254px;
              `
        )}
      >
        <div className={cx(mini ? 'flex flex-wrap gap-3' : 'flex-col gap-2')}>
          <div
            className={cx(
              mini
                ? 'flex-col text-center'
                : showDevices || showDeskttopLyrics
                ? 'my-3 flex  justify-between gap-5'
                : 'my-5 flex  justify-between gap-5'
            )}
          >
            {/* Minimize */}
            <motion.button
              layout='position'
              animate={{ rotate: mini ? 90 : 0 }}
              className={cx(
                'text-black/90 transition-colors duration-400 dark:text-white/40 hover:dark:text-white/90',
                mini && css``
              )}
              onClick={() => {
                persistedUiStates.minimizePlayer = !mini
              }}
            >
              <Icon name='hide-list' className='h-7 w-7 ' />
            </motion.button>

            {/* Media controls */}
            <motion.div 
            className={cx(
              'flex flex-wrap gap-2 text-black/95 dark:text-white/80',
              )}
            transition={{duration:0.5,ease}}
            >
              <motion.button
                layout='position'
                animate={{ rotate: mini ? 90 : 0 }}
                onClick={() => {
                  if (!track) return
                  player.prevTrack()
                }}
                disabled={!track}
                className='rounded-full bg-black/10 p-2.5 transition-colors duration-400 dark:bg-white/10 hover:dark:bg-white/20'
              >
                <Icon name='previous' className='h-6 w-6' />
              </motion.button>
              <motion.button
                layout='position'
                animate={{ rotate: mini ? 90 : 0 }}
                onClick={() => {
                  track && player.playOrPause()
                  window.ipcRenderer?.send(IpcChannels.Pause)
                }}
                className='rounded-full bg-black/10 p-2.5 transition-colors duration-400 dark:bg-white/10 hover:dark:bg-white/20'
              >
                <Icon
                  name={
                    [PlayerState.Playing, PlayerState.Loading].includes(state) ? 'pause' : 'play'
                  }
                  className='h-6 w-6 '
                />
              </motion.button>
              <motion.button
                layout='position'
                animate={{ rotate: mini ? 90 : 0 }}
                onClick={() => {
                  if (!track) return
                  player.nextTrack()
                }}
                disabled={!track}
                className='rounded-full bg-black/10 p-2.5 transition-colors duration-400 dark:bg-white/10 hover:dark:bg-white/20'
              >
                <Icon name='next' className='h-6 w-6 ' />
              </motion.button>
            </motion.div>

            {/* Like */}
            <LikeButton />
          </div>

          {!mini && (
            <div className='iterms-center flex flex-row justify-center gap-5 transition-colors duration-400'>
              {window.env?.isElectron && (
                <>
                  {showDevices && <AudioOutputDevices />}
                  {showDeskttopLyrics && <DesktopLyric />}
                </>
              )}
            </div>
          )}
          {!mini && <VolumeSlider />}
        </div>
      </motion.div>
    </MotionConfig>
  )
}

function DesktopLyric() {
  const { showDesktopLyrics } = useSnapshot(settings)
  const toggleDesktopLyricShow = async () => {
    settings.showDesktopLyrics = !showDesktopLyrics

    const show = await window.ipcRenderer?.invoke(IpcChannels.SetDesktopLyric)

    settings.showDesktopLyrics = show ? show : false
  }
  return (
    <div
      className={cx(
        css`
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          text-align: center;
        `
      )}
    >
      <motion.button
        layout='position'
        className={cx(showDesktopLyrics && 'text-brand-600')}
        onClick={toggleDesktopLyricShow}
      >
        <Icon name='lyrics' className={cx('h-5 w-5')} />
      </motion.button>
    </div>
  )
}

function VolumeSlider() {
  const { t } = useTranslation()
  const { volume } = useSnapshot(player)
  const onChange = (volume: number) => {
    player.volume = volume
  }
  return (
    <div
      className={cx(
        css`
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          text-align: center;
        `
      )}
    >
      <motion.button layout='position' className={cx()}>
        <Icon name={player.volume == 0 ? 'volume-mute' : 'volume-half'} className={cx('h-5 w-5')} />
      </motion.button>

      <motion.div
        className={cx(
          'pr-1 pl-1',
          css(`
        width: 180px;
      `)
        )}
        transition={{ ease }}
      >
        <Slider
          value={volume}
          min={0}
          max={1}
          onChange={onChange}
          alwaysShowTrack
          alwaysShowThumb={false}
        />
      </motion.div>
      <motion.button
        layout='position'
        className={
          cx(
            ' transition-colors duration-400 ',
          )
          // just dont need this I guess
          // ' text-black dark:text-white'
        }
      >
        <Icon name='volume' className={cx('h-5 w-5')} />
      </motion.button>
    </div>
  )
}

export default Controls
