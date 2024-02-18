import { cx, css } from '@emotion/css'
import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { ease } from '@/web/utils/const'
import Icon from '@/web/components/Icon'
import LoginWithPhoneOrEmail from './LoginWithPhoneOrEmail'
import LoginWithQRCode from './LoginWithQRCode'
import persistedUiStates from '@/web/states/persistedUiStates'
import useUser, { useIsLoggedIn } from '@/web/api/hooks/useUser'
import { useTranslation } from 'react-i18next'

const OR = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='mt-4 flex items-center'>
        <div className='h-px flex-grow bg-white/20'></div>
        <div className='mx-2 text-16 font-medium text-white'>{t`auth.or`}</div>
        <div className='h-px flex-grow bg-white/20'></div>
      </div>

      <div className='mt-4 flex justify-center'>
        <button
          className='text-16 font-medium text-night-50 transition-colors duration-400 hover:text-white'
          onClick={onClick}
        >
          {children}
        </button>
      </div>
    </>
  )
}

const Login = () => {
  const { t } = useTranslation()

  const { data: user, isLoading: isLoadingUser } = useUser()
  const isLoggedIn = useIsLoggedIn()
  const { loginType } = useSnapshot(persistedUiStates)
  const { showLoginPanel } = useSnapshot(uiStates)
  const [cardType, setCardType] = useState<'qrCode' | 'phone/email'>(
    loginType === 'qrCode' ? 'qrCode' : 'phone/email'
  )

  // Show login panel when user first loads the page and not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      uiStates.showLoginPanel = true
    }
  }, [isLoggedIn])

  const animateCard = useAnimation()
  const handleSwitchCard = async () => {
    const transition = { duration: 0.36, ease }
    await animateCard.start({
      rotateY: 90,
      opacity: 0,
      transition,
    })

    setCardType(cardType === 'qrCode' ? 'phone/email' : 'qrCode')
    persistedUiStates.loginType = cardType === 'qrCode' ? 'phone' : 'qrCode'

    await animateCard.start({
      rotateY: 0,
      opacity: 1,
      transition,
    })
  }

  return (
    <>
      {/* Blur bg */}
      <AnimatePresence>
        {showLoginPanel && (
          <motion.div
            className='fixed inset-0 z-30 bg-black/80 backdrop-blur-3xl lg:rounded-12'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence>
        {showLoginPanel && (
          <div className='fixed inset-0 z-30 flex items-center justify-center pt-24 backdrop-blur-xl'>
            <motion.div
              className='flex flex-col items-center'
              variants={{
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.3,
                    ease,
                    delay: 0.2,
                  },
                },
                hide: {
                  opacity: 0,
                  y: 100,
                  transition: {
                    duration: 0.3,
                    ease,
                  },
                },
              }}
              initial='hide'
              animate='show'
              exit='hide'
            >
              {/* Login card */}
              <AnimatePresence>
                <motion.div
                  animate={animateCard}
                  className={cx(
                    'relative h-fit rounded-48 bg-white/10 p-9',
                    css`
                      width: 392px;
                    `
                  )}
                >
                  {cardType === 'qrCode' && <LoginWithQRCode />}
                  {cardType === 'phone/email' && <LoginWithPhoneOrEmail />}

                  <OR onClick={handleSwitchCard}>
                    {cardType === 'qrCode' ? t`auth.use-phone-or-email` : t`auth.scan-qr-code`}
                  </OR>
                </motion.div>
              </AnimatePresence>

              {/* Close button */}
              <AnimatePresence>
                <motion.div
                  layout='position'
                  transition={{ ease }}
                  onClick={() => (uiStates.showLoginPanel = false)}
                  className='mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/50 transition-colors duration-300 hover:bg-white/20 hover:text-white/70'
                >
                  <Icon name='x' className='h-6 w-6' />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Login
