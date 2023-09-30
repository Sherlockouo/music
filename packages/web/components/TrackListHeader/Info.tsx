import { formatDate } from '@/web/utils/common'
import Icon from '@/web/components/Icon'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '@/web/hooks/useIsMobile'
import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import DescriptionViewer from '../DescriptionViewer'

const Info = ({
  title,
  creatorName,
  creatorLink,
  description,
  extraInfo,
  isLoading,
}: {
  title?: string
  creatorName?: string
  creatorLink?: string
  description?: string
  extraInfo?: string | ReactNode
  isLoading?: boolean
}) => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [isOpenDescription, setIsOpenDescription] = useState(false)

  return (
    <div>
      {/* Title */}
      {isLoading ? (
        <div className='mt-2.5  text-28 font-semibold lg:mt-0 lg:text-36 lg:font-medium'>
          <span className='rounded-full'>PLACEHOLDER</span>
        </div>
      ) : (
        <div className='mt-2.5 text-28 font-semibold transition-colors duration-300  lg:mt-0 lg:text-36 lg:font-medium'>
          {title}
        </div>
      )}

      {/* Creator */}
      {isLoading ? (
        <div className='mt-2.5 lg:mt-6'>
          <span className='text-24 font-medium'>
            <span className='rounded-full'>PLACEHOLDER</span>
          </span>
        </div>
      ) : (
        <div className='mt-2.5 lg:mt-6'>
          <span
            onClick={() => creatorLink && navigate(creatorLink)}
            className='text-24 font-medium transition-colors duration-300'
          >
            {creatorName}
          </span>
        </div>
      )}

      {/* Extra info */}
      {isLoading ? (
        <div className='mt-1 flex items-center text-12 font-medium lg:text-14 lg:font-bold'>
          <span className='rounded-full'>PLACEHOLDER</span>
        </div>
      ) : (
        <div className='mt-1 flex items-center text-12 font-medium transition-colors duration-300 lg:text-14 lg:font-bold'>
          {extraInfo}
        </div>
      )}

      {/* Description */}
      {!isMobile && description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='line-clamp-3 mt-6 whitespace-pre-wrap text-14 font-bold transition-colors duration-300'
          dangerouslySetInnerHTML={{
            __html: description,
          }}
          onClick={() => setIsOpenDescription(true)}
        ></motion.div>
      )}

      <DescriptionViewer
        description={description || ''}
        isOpen={isOpenDescription}
        onClose={() => setIsOpenDescription(false)}
        title={title || ''}
      />
    </div>
  )
}

export default Info
