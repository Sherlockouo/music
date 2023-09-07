import { fetchTracksWithReactQuery } from '@/web/api/hooks/useTracks'
import { fetchTracks } from '@/web/api/track'
import contextMenus, { closeContextMenu } from '@/web/states/contextMenus'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCopyToClipboard } from 'react-use'
import { useSnapshot } from 'valtio'
import BasicContextMenu from './BasicContextMenu'
import player from '@/web/states/player'
import useUserLikedTracksIDs, { useMutationLikeATrack } from '@/web/api/hooks/useUserLikedTracksIDs'
import { useIsLoggedIn } from '@/web/api/hooks/useUser'
import uiStates from '@/web/states/uiStates'

const TrackContextMenu = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, copyToClipboard] = useCopyToClipboard()

  const { type, dataSourceID, target, cursorPosition, options } = useSnapshot(contextMenus)
  const likeATrack = useMutationLikeATrack()
  const loggedIn = useIsLoggedIn()

  return (
    <AnimatePresence>
      {type === 'track' && dataSourceID && target && cursorPosition && (
        <BasicContextMenu
          target={target}
          cursorPosition={cursorPosition}
          onClose={closeContextMenu}
          options={options}
          items={[
            {
              type: 'item',
              label: t`context-menu.add-to-queue`,
              onClick: () => {
                player.addToNextPlay(Number(dataSourceID))
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'item',
              label: t`context-menu.go-to-artist`,
              onClick: async () => {
                const tracks = await fetchTracksWithReactQuery({
                  ids: [Number(dataSourceID)],
                })
                const track = tracks?.songs?.[0]
                if (track) navigate(`/artist/${track.ar[0].id}`)
              },
            },
            {
              type: 'item',
              label: t`context-menu.go-to-album`,
              onClick: async () => {
                const tracks = await fetchTracksWithReactQuery({
                  ids: [Number(dataSourceID)],
                })
                const track = tracks?.songs?.[0]
                if (track) navigate(`/album/${track.al.id}`)
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'item',
              label: t`context-menu.add-to-liked-tracks`,
              onClick: () => {
                if(!loggedIn){
                  toast.error('Plz login first')
                  uiStates.showLoginPanel = true
                  return
                }
                likeATrack.mutateAsync(Number(dataSourceID))
                toast.success('Like Success')
              },
            },
            {
              type: 'item',
              label: t`context-menu.add-to-playlist`,
              onClick: () => {
                // 收藏到歌单
                // player.addToPlayList(Number(dataSourceID))
                toast.success('开发中')
              },
              
            },
            {
              type: 'submenu',
              label: t`context-menu.share`,
              items: [
                {
                  type: 'item',
                  label: t`context-menu.copy-netease-link`,
                  onClick: () => {
                    copyToClipboard(`https://music.163.com/#/album?id=${dataSourceID}`)
                    toast.success(t`toasts.copied`)
                  },
                  
                },
                {
                  type: 'item',
                  label: t`context-menu.copy-r3play-link`,
                  onClick: () => {
                    copyToClipboard(`${window.location.origin}/album/${dataSourceID}`)
                    toast.success(t`toasts.copied`)
                  },
                },
              ],
            },
          ]}
        />
      )}
    </AnimatePresence>
  )
}

export default TrackContextMenu
