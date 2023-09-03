import persistedUiStates from '@/web/states/persistedUiStates'
import player from '@/web/states/player'
import { ease } from '@/web/utils/const'
import { cx, css } from '@emotion/css'
import { MotionConfig, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'
import Icon from '../Icon'
import { State as PlayerState } from '@/web/utils/player'
import useUserLikedTracksIDs, { useMutationLikeATrack } from '@/web/api/hooks/useUserLikedTracksIDs'
import { toast } from 'react-hot-toast'
import { BlockDescription, BlockTitle, Option, OptionText, Switch, Input } from '@/web/pages/Settings/Controls'
import Slider from '@/web/components/Slider'
import { ceil } from 'lodash'
import { useTranslation } from 'react-i18next'

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
      <Icon name={isLiked ? 'heart' : 'heart-outline'} className={cx('h-7 w-7','text-center')} />
    </motion.button>
  )
}

const Controls = () => {
  const { state, track } = useSnapshot(player)
  const { minimizePlayer: mini } = useSnapshot(persistedUiStates)

  return (
    <MotionConfig transition={{ ease, duration: 0.6 }}>
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
                // width: 100%;
              `
        )}
      >
        <div className={
          cx(
            mini
              ? 'flex flex-wrap gap-3'
              : 'flex-col gap-2'
          )
        }>

          <div className={
            cx(mini ? 'flex-col text-center' : 'flex gap-5 justify-between')
          }>

            {/* Minimize */}
            <motion.button
              layout='position'
              animate={{ rotate: mini ? 90 : 0 }}
              className={cx('text-black/90 transition-colors duration-400 dark:text-white/40 hover:dark:text-white/90',mini && css`
                
              `)}
              onClick={() => {
                persistedUiStates.minimizePlayer = !mini
              }}
            >
              <Icon name='hide-list' className='h-7 w-7 ' />
            </motion.button>

            {/* Media controls */}
            <div className='flex flex-wrap gap-2 text-black/95 dark:text-white/80'>

              <motion.button
                layout='position'
                animate={{ rotate: mini ? 90 : 0 }}
                onClick={() => track && player.prevTrack()}
                disabled={!track}
                className='rounded-full bg-black/10 p-2.5 transition-colors duration-400 dark:bg-white/10 hover:dark:bg-white/20'
              >
                <Icon name='previous' className='h-6 w-6' />
              </motion.button>
              <motion.button
                layout='position'
                animate={{ rotate: mini ? 90 : 0 }}
                onClick={() => track && player.playOrPause()}
                className='rounded-full bg-black/10 p-2.5 transition-colors duration-400 dark:bg-white/10 hover:dark:bg-white/20'
              >
                <Icon
                  name={[PlayerState.Playing, PlayerState.Loading].includes(state) ? 'pause' : 'play'}
                  className='h-6 w-6 '
                />
              </motion.button>
              <motion.button
                layout='position'
                animate={{ rotate: mini ? 90 : 0 }}
                onClick={() => {
                  track && player.nextTrack()
                }}
                disabled={!track}
                className='rounded-full bg-black/10 p-2.5 transition-colors duration-400 dark:bg-white/10 hover:dark:bg-white/20'
              >
                <Icon name='next' className='h-6 w-6 ' />
              </motion.button>
            </div>

            {/* Like */}
            <LikeButton />
          </div>

          {
            !mini && <VolumeSlider />
          }
        </div>
      </motion.div>
    </MotionConfig>
  )
}

function VolumeSlider() {
  const { t } = useTranslation()
  const { volume } = useSnapshot(player)
  const onChange = (volume: number) => {
    player.volume = volume
  }
  return (
    <div className={cx(css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    padding-top: 3px;
    `)}>
      <Icon name= {player.volume == 0 ? 'volume-mute':'volume-half'} className={cx('text-white/80',player.volume == 0 ? 'h-4 w-4':'h-5 w-5')} />
      <div className={cx('pr-1 pl-1', css(`
        width: 180px;
      `))}>
        <Slider
          value={volume}
          min={0}
          max={1}
          onChange={onChange}
          alwaysShowTrack
          alwaysShowThumb
        />
      </div>
        <Icon name='volume' className='h-5 w-5 text-white/80'  />
      {/* <div className='mt-1 flex justify-between text-14 font-bold text-neutral-100'>
        <span>0</span>
        <span>{ceil(volume * 100)}</span>
      </div> */}
    </div>
  )
}

export default Controls
