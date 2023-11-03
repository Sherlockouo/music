import { css, cx, keyframes } from '@emotion/css'

const wave = keyframes`
    0% { transform: scaleY(1) }
    50% { transform: scaleY(0.2) }
    100% { transform: scaleY(1)}
  `
const animation = css`
  transform-origin: bottom;
  animation: ${wave} 1s ease-in-out infinite;
`
const delay = ['-100ms', '-500ms', '-1200ms', '-1000ms', '-700ms']

// 做频谱分析
const Wave = ({ playing }: { playing: boolean }) => {
  return (
    <div className='grid h-3 flex-shrink-0 grid-cols-5 items-end gap-0.5'>
      {[...new Array(5).keys()].map(i => (
        <div
          key={i}
          className={cx(
            'bg-accent-color-500 h-full w-0.5 transition-colors duration-500',
            animation
          )}
          style={{
            animationDelay: delay[i],
            animationPlayState: playing ? 'running' : 'paused',
          }}
        ></div>
      ))}
    </div>
  )
}

export default Wave
