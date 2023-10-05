import { cx } from '@emotion/css'

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
  }[]
  value: string
  onChange: (id: T) => void
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={cx('no-scrollbar flex overflow-y-auto gap-4', className)} style={style}>
      {tabs.map(tab => (
        <div
          key={tab.id as string}
          className={cx(
            'mr-1 rounded-12 py-3 px-6 text-16 font-medium backdrop-blur transition duration-500', 
            'dark:bg-white/10 dark:text-white/80 hover:dark:bg-white/20 ',
            'bg-black/10 text-black/80 hover:bg-black/20 ',
            value === tab.id && 'bg-accent-color-500 dark:bg-neutral-500 dark:text-white/80 text-black/80'
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.name}
        </div>
      ))}
    </div>
  )
}

export default Tabs
