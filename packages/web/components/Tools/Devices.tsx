import player from '@/web/states/player'
import React, { useEffect, useState } from 'react'
import Icon from '../Icon'
import { cx } from '@emotion/css'
import { motion } from 'framer-motion'
import { IpcChannels } from '@/shared/IpcChannels'
import Loading from '../Animation/Loading'
import useGAEvent from '@/web/api/hooks/useGA'
const AudioOutputDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const togglePopover = () => {
    setIsOpen(!isOpen)
    useGAEvent('user-action', 'devices', 'click', 1)
  }

  useEffect(() => {
    const getAudioOutputDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()

        const audioOutputDevices = devices.filter(device => {
          if (device.label.includes('默认') || device.label.includes('default')) {
            setSelectedDevice(device.deviceId)
          }
          return device.kind === 'audiooutput'
        })
        setDevices(audioOutputDevices)
      } catch (error) {
        console.error('Error getting audio output devices:', error)
      }
    }
    getAudioOutputDevices()
    // update devices every 5s
    setInterval(() => {
      getAudioOutputDevices()
    }, 1000 * 5)
  }, [])

  const handleDeviceChange = (deviceId: MediaDeviceInfo['deviceId']) => {
    setSelectedDevice(deviceId)
    player.setDevice(deviceId)
  }

  return (
    <>
      {window.env?.isElectron && (
        <motion.div
          className={cx(
            'relative',
            'text-black/90 transition-colors duration-400 dark:text-white/40 hover:dark:text-white/90'
          )}
          onClick={() => {
            togglePopover()
          }}
        >
          <Icon name='indent' className='h-5 w-5' />
          {isOpen && (
            <div
              className={cx(
                'absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 transform rounded-12 p-4 ',
                'dark:boder-white/5 border border-black/5 bg-white/30 backdrop-blur-3xl dark:bg-black/60'
              )}
            >
              {devices.length == 0 ? (
                <Loading />
              ) : (
                <ul className='w-48'>
                  {devices.map(device => (
                    <li
                      key={device.deviceId}
                      onClick={() => handleDeviceChange(device.deviceId)}
                      className={cx(
                        'w-full rounded-sm px-2 text-xs hover:bg-black/15 hover:dark:bg-white/15',
                        selectedDevice === device.deviceId
                          ? 'bold bg-black/10 dark:bg-white/10'
                          : 'normal'
                      )}
                    >
                      {device.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </motion.div>
      )}
    </>
  )
}

export default AudioOutputDevices
