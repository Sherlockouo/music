import Icon from '@/web/components/Icon'
import { cx } from '@emotion/css'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SettingsButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/settings')}
      className={cx(
        'app-region-no-drag flex h-12 w-12 items-center justify-center rounded-full transition duration-400 text-neutral-500 dark:text-neutral-300 dark:bg-neutral-700 bg-white/60 hover:bg-white transition duration-400 dark:hover:bg-neutral-100',
        className
      )}
    >
      <Icon name='settings' className='h-5 w-5 ' />
    </button>
  )
}

export default SettingsButton
