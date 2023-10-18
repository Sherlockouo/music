import { css, cx } from '@emotion/css'
import { motion } from 'framer-motion'

export interface DropdownItem {
  label: string
  onClick: () => void
}

function Dropdown({ items, onClose }: { items: DropdownItem[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: 1,
        scale: 1.5,
        transition: {
          duration: 0.1,
        },
      }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cx(
        'origin-top rounded-12 border border-white/[.06] p-px py-2.5 shadow-xl outline outline-1 outline-black backdrop-blur-3xl dark:border-white/[.06]',
        'bg-white dark:bg-black',
        css`
          min-width: 200px;
        `
      )}
    >
      {items.map((item, index) => (
        <div
          className={cx(
            'relative flex w-full items-center justify-between whitespace-nowrap rounded-[5px] p-3 text-16 font-medium ',
            'bg-white/90 dark:bg-black/90'
          )}
          key={index}
          onClick={() => {
            item.onClick()
            onClose()
          }}
        >
          {item.label}
        </div>
      ))}
    </motion.div>
  )
}

export default Dropdown
