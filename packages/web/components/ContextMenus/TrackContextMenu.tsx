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
import { useMemo, useRef } from 'react'
import CoverRow from '@/web/components/CoverRow'
import useUserPlaylists from '@/web/api/hooks/useUserPlaylists'
import useUser from '@/web/api/hooks/useUser'
import Image from '../Image'
import { resizeImage } from '@/web/utils/common'
import { cx } from '@emotion/css'
import { addSongToPlayList } from '../../api/playlist'

const Playlist = ({ playlist, datasourceID }: { playlist: Playlist; datasourceID: Number }) => {
  const { t } = useTranslation()
  return (
    <div
      className={cx(
        'justify-space-between group flex w-full items-center rounded-24 ',
        'text-black hover:bg-black/10 hover:text-black/90 dark:text-white hover:dark:bg-white/10 hover:dark:text-white/90'
      )}
      onClick={() => {
        addSongToPlayList({
          op: 'add',
          pid: playlist.id,
          tracks: datasourceID + '',
        })
        toast.success(t`toasts.added-to-playlist`)
      }}
    >
      <Image
        key={playlist.id}
        src={resizeImage(playlist.coverImgUrl || playlist?.picUrl || '', 'xs')}
        className='aspect-square h-10 w-10 rounded-24'
      />
      {/* Name */}
      <div className='bottom-0 p-3 text-sm font-medium  transition-all duration-400'>
        {playlist.name}
      </div>
    </div>
  )
}

const TrackContextMenu = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useUser()

  const [, copyToClipboard] = useCopyToClipboard()

  const { type, dataSourceID, target, cursorPosition, options } = useSnapshot(contextMenus)
  const likeATrack = useMutationLikeATrack()
  const loggedIn = useIsLoggedIn()
  const { data: playlists } = useUserPlaylists()
  const myPlaylists = useMemo(
    () => playlists?.playlist?.slice(1).filter(p => p.userId === user?.data?.account?.id),
    [playlists, user]
  )

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
              label: t`context-menu.play`,
              onClick: () => {
                player.addToFirstPlay(Number(dataSourceID))
                player.playTrack(Number(dataSourceID))
              },
            },
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
                if (!loggedIn) {
                  toast.error('Plz login first')
                  uiStates.showLoginPanel = true
                  return
                }
                likeATrack.mutateAsync(Number(dataSourceID)).then(() => {
                  toast.success('Like Success')
                })
              },
            },
            {
              type: 'submenu',
              label: t`context-menu.add-to-playlist`,
              items: [
                {
                  type: 'item',
                  children: (
                    <>
                      <div className='no-scrollbar h-64 w-full overflow-y-auto rounded-12 bg-white/10 dark:bg-black/10'>
                        {myPlaylists?.map(playlist => (
                          <Playlist
                            key={playlist.id}
                            playlist={playlist}
                            datasourceID={Number(dataSourceID)}
                          />
                        ))}
                      </div>
                    </>
                  ),
                },
              ],
            },
            {
              type: 'submenu',
              label: t`context-menu.share`,
              items: [
                {
                  type: 'item',
                  label: t`context-menu.copy-netease-link`,
                  onClick: () => {
                    copyToClipboard(`https://music.163.com/#/song?id=${dataSourceID}`)
                    toast.success(t`toasts.copied`)
                  },
                },
                {
                  type: 'item',
                  label: t`context-menu.copy-r3playx-link`,
                  onClick: async () => {
                    const audioSource = await player.getAudioSource(Number(dataSourceID))
                    copyToClipboard(`${audioSource.audio}`)
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
