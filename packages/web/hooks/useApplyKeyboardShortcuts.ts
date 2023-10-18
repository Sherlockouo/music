import { useCallback, useEffect, useMemo } from 'react'
import useKeyboardShortcuts from './useKeyboardShortcuts'
import useOSPlatform from './useOSPlatform'
import { last } from 'lodash-es'
import player from '../states/player'
import { useMutationLikeATrack } from '../api/hooks/useUserLikedTracksIDs'
import { useSnapshot } from 'valtio'

const useApplyKeyboardShortcuts = () => {
  const platform = useOSPlatform()
  const shortcuts = useKeyboardShortcuts()
  const { track } = useSnapshot(player)
  const likeATrack = useMutationLikeATrack()

  const shortcutEntries = useMemo(() => {
    return Object.entries(shortcuts) as [string, KeyboardShortcutItem][]
  }, [shortcuts])

  const tryEmit = useCallback(
    (event: KeyboardEvent) => {
      const matched = shortcutEntries.find(([_, value]) => {
        if (!value[0]) {
          return false
        }

        if (
          event.metaKey &&
          value[0].every(key => key !== (platform === 'darwin' ? 'Meta' : 'Super'))
        ) {
          return false
        }

        if (
          event.altKey &&
          value[0].every(key => key !== (platform === 'darwin' ? 'Option' : 'Alt'))
        ) {
          return false
        }

        if (event.ctrlKey && value[0].every(key => key !== 'Control')) {
          return false
        }

        if (event.shiftKey && value[0].every(key => key !== 'Shift')) {
          return false
        }

        if (event.code !== last(value[0])) {
          return false
        }

        return true
      })

      if (matched) {
        event.preventDefault()

        console.log('matched', matched)

        switch (matched[0]) {
          case 'playPause':
            player.playOrPause()
            break
          case 'next':
            player.nextTrack()
            break
          case 'previous':
            player.prevTrack()
            break
          case 'volumeUp':
            player.volume += 0.1
            break
          case 'volumeDown':
            player.volume -= 0.1
            break
          case 'favorite':
            track && likeATrack.mutateAsync(track.id)
            break
        }
      }
    },
    [likeATrack, platform, shortcutEntries, track]
  )

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null

      if (!target) {
        return
      }

      // 所有输入框都禁用快捷键

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      tryEmit(event)
    }

    window.addEventListener('keydown', handle)

    return () => {
      window.removeEventListener('keydown', handle)
    }
  }, [tryEmit])
}

export default useApplyKeyboardShortcuts
