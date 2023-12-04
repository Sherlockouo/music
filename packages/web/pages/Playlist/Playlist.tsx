import { useParams } from 'react-router-dom'
import PageTransition from '@/web/components/PageTransition'
import TrackList from '../../components/TrackList/TrackListVirtual'
import player from '@/web/states/player'
import usePlaylist from '@/web/api/hooks/usePlaylist'
import Header from './Header'
import useTracks from '@/web/api/hooks/useTracks'
import React from 'react'

const Playlist = () => {
  const params = useParams()
  const { data: playlist } = usePlaylist({
    id: Number(params.id),
  })

  const { data: playlistTracks } = useTracks({
    ids: playlist?.playlist?.trackIds?.map(t => t.id) ?? [],
  })

  const onPlay = async (trackID: number | null = null) => {
    await player.playPlaylist(playlist?.playlist?.id, trackID)
  }

  return (
    <PageTransition>
      <div className='h-full'>
        <TrackList
          Header={ Header }
          tracks={playlistTracks?.songs ?? playlist?.playlist?.tracks ?? []}
          onPlay={onPlay}
          className='z-10 mt-10'
        />
      </div>
    </PageTransition>
  )
}

const PlaylistMemo = React.memo(Playlist)
PlaylistMemo.displayName = "Playlist"
export default PlaylistMemo
