import { css, cx } from '@emotion/css'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { gsap } from '@/web/utils/gsapSetup'
import { useGSAP } from '@gsap/react'

export interface DropdownItem {
  label: string
  onClick: () => void
}

function Dropdown({ items, onClose }: { items: DropdownItem[]; onClose: () => void }) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // GSAP elastic entrance with item stagger
  useGSAP(
    () => {
      if (!dropdownRef.current) return

      // Panel scale + opacity with back.out bounce
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, scale: 0.92, y: -6 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.28,
          ease: 'back.out(2.5)',
        }
      )

      // Items stagger in
      const dropdownItems = dropdownRef.current.querySelectorAll('[data-dropdown-item]')
      if (dropdownItems.length > 0) {
        gsap.fromTo(
          dropdownItems,
          { opacity: 0, y: -4 },
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.03,
            ease: 'power2.out',
            delay: 0.08,
          }
        )
      }
    },
    { scope: dropdownRef, dependencies: [] }
  )

  return (
    <motion.div
      ref={dropdownRef}
      initial={false} // GSAP handles enter
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className={cx(
        'origin-top rounded-12 border border-white/[.06] p-px py-2.5 shadow-xl outline outline-1 outline-black backdrop-blur-3xl dark:border-white/[.06]',
        'bg-white dark:bg-black',
        css`
          min-width: 200px;
        `
      )}
      style={{ opacity: 0 }} // start invisible, GSAP reveals
    >
      {items.map((item, index) => (
        <div
          data-dropdown-item
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
