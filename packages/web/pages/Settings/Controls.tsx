import Icon from '@/web/components/Icon'
import { cx } from '@emotion/css'
import { motion } from 'framer-motion'

export function Switch({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <motion.div
      className={cx(
        'flex w-11 items-center justify-start rounded-full p-1 transition-colors duration-500',
        enabled ? 'bg-brand-700' : 'bg-black/30 dark:bg-white/30'
      )}
      onClick={() => onChange(!enabled)}
    >
      <motion.div
        animate={{ x: enabled ? 16 : 0 }}
        className='h-5 w-5 rounded-full shadow-sm bg-white dark:bg-gray-800'
      ></motion.div>
    </motion.div>
  )
}

export function Select<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { name: string; value: T }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className='relative inline-block rounded-md bg-black/10 dark:bg-white/10 font-medium text-neutral-400'>
      <select
        onChange={e => onChange(e.target.value as T)}
        value={value}
        className='h-full w-full appearance-none bg-transparent py-1 pr-7 pl-3 focus:outline-none'
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>

      <Icon
        name='dropdown-triangle'
        className='pointer-events-none absolute right-2.5 h-2.5 w-2.5 text-white/1 dark:text-black/1'
        style={{ top: '11px' }}
      />
    </div>
  )
}

export function Input({
  value,
  onChange,
  type = 'text',
}: {
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'password' | 'number'
}) {
  return (
    <div className=''>
      <div className='mb-1 text-14 font-medium text-white/30'>Host</div>
      <div className='inline-block rounded-md bg-neutral-800 font-medium text-neutral-400'>
        <input
          className='appearance-none bg-transparent py-1 px-3'
          onChange={e => onChange(e.target.value)}
          {...{ type, value }}
        />
      </div>
    </div>
  )
}

export function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className='rounded-md bg-black/10 py-1 px-3 font-medium text-neutral-400 transition-colors duration-300 hover:bg-neutral-500 hover:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-300'
    >
      {children}
    </button>
  )
}

export function BlockTitle({ children }: { children: React.ReactNode }) {
  return <div className='text-21 font-medium'>{children}</div>
}

export function BlockDescription({ children }: { children: React.ReactNode }) {
  return <div className='my-1 text-16 font-medium'>{children}</div>
}

export function Option({ children }: { children: React.ReactNode }) {
  return <div className='my-3 flex items-center justify-between'>{children}</div>
}

export function OptionText({ children }: { children: React.ReactNode }) {
  return <div className='text-16 font-medium'>{children}</div>
}
