import Icon from '../Icon'
import { cx } from '@emotion/css'

const Pin = ({ className }: { className?: string }) => {
  return (
    <div className={cx(className)}>
      <Icon name='pin' className='h-3 w-3' />
    </div>
  )
}

export default Pin
