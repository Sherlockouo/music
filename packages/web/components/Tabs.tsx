import { cx } from '@emotion/css'
import Icon from './Icon'
import { IconNames } from './Icon/iconNamesType'

function Tabs<T>({
  tabs,
  value,
  onChange,
  className,
  style,
}: {
  tabs: {
    id: T
    name: string
    iconName?: IconNames
  }[]
  value: string
  onChange: (id: T) => void
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={cx('no-scrollbar flex gap-4 overflow-y-auto', className)} style={style}>
      {tabs.map(tab => (
        <div
          key={tab.id as string}
          className={cx(
            'mr-1 rounded-12 py-3 px-6 text-16 font-medium backdrop-blur transition duration-500',
            'dark:bg-white/10 dark:text-white/80 hover:dark:bg-white/20 ',
            'bg-black/10 text-black/80 hover:bg-black/20 ',
            value === tab.id &&
              'bg-accent-color-500 text-black/80 dark:bg-neutral-500 dark:text-white/80',
            tab.iconName && 'iterms-center flex flex-row gap-2'
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.iconName && <Icon name={tab.iconName} className='h-5 w-5' />}
          {tab.name}
        </div>
      ))}
    </div>
  )
}

export default Tabs
