import { css, cx } from '@emotion/css'
import { motion, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ease } from '@/web/utils/const'
import Icon from '../Icon'

const buttonClassNames =
  'app-region-no-drag rounded-full dark:bg-white/10 bg-black/10 p-2.5 backdrop-blur-3xl dark:hover:bg-white/20 dark:hover:text-white/60 hover:bg-black/20 hover:text-black/60 transition-all duration-100 ease-in'

const NavigationButtons = () => {
  const navigate = useNavigate()
  const controlsBack = useAnimation()
  const controlsForward = useAnimation()
  const transition = { duration: 0.08, ease }

  return (
    <>
      <motion.div className={cx()}>
        <button
          onClick={() => navigate(-1)}
          onMouseDown={async () => {
            await controlsBack.start({ x: -5 })
            await controlsBack.start({ x: 0 })
          }}
          className={buttonClassNames}
        >
          <motion.div
            animate={controlsBack}
            transition={transition}
            className={cx(' text-black dark:text-white')}
          >
            <Icon name='back' className='h-7 w-7' />
          </motion.div>
        </button>
        <button
          onClick={async () => {
            navigate(1)
          }}
          onMouseDown={async () => {
            await controlsForward.start({ x: 5 })
            await controlsForward.start({ x: 0 })
          }}
          className={cx('ml-2.5', buttonClassNames)}
        >
          <motion.div
            animate={controlsForward}
            transition={transition}
            className={cx('  text-black dark:text-white')}
          >
            <Icon name='forward' className='h-7 w-7' />
          </motion.div>
        </button>
      </motion.div>
    </>
  )
}

export default NavigationButtons
