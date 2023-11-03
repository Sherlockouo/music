import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'

const useGAEvent = (
  category: string,
  action: string,
  label: string,
  value?: number,
  nonInteraction?: boolean,
  transport?: 'beacon' | 'xhr' | 'image'
) => {
  const send = async () => {
    ReactGA.event({
      category,
      action,
      label,
      value,
      nonInteraction,
      transport,
    })
    console.log('send event')
  }
  send()
}

export default useGAEvent

export function useGASend() {
  useEffect(() => {
    const send = async () => {
      ReactGA.send({
        hitType: 'pageview',
        page: window.location.pathname + window.location.search,
        title: 'r3playx page view',
      })
    }
    send()
  }, [])
}
