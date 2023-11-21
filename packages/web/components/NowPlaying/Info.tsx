import player from '@/web/states/player'
import { MotionConfig, motion } from 'framer-motion'
import { cx, css } from '@emotion/css'
import { useSnapshot } from 'valtio'
import ArtistInline from '../ArtistsInLine'
import Progress from './Progress'
import { ease } from '@/web/utils/const'
const Info = () => {
  const { track } = useSnapshot(player)
  return (
    <MotionConfig transition={{ ease, duration: 0.5 }}>
      <motion.div
        className={cx(
          'm-3 flex flex-col items-center rounded-20 bg-white/60 p-8 font-medium backdrop-blur-3xl dark:bg-black/70'
        )}
      >
        {/* Track Info */}
        <div className='line-clamp-1 text-lg text-black dark:text-white'>{track?.name}</div>
        <ArtistInline
          artists={track?.ar || []}
          className='text-black/30 dark:text-white/30'
          hoverClassName='hover:text-black/50 dark:hover:text-white/70 transition-colors duration-400'
        />

        {/* Dividing line */}
        <div className='mt-2 h-px w-2/5 bg-black/10 dark:bg-white/10'></div>

        {/* Progress */}
        <Progress />

        {/* Controls placeholder */}
        <div className='h-11'></div>
      </motion.div>
    </MotionConfig>
  )
}
export default Info
