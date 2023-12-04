import {
  fetchDailyRecommendPlaylists,
  fetchDailyRecommendSongs,
  fetchRecommendedPlaylists,
} from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'
import TrackList from '@/web/components/TrackList/TrackListVirtual'
import player from '@/web/states/player'
import Icon from '@/web/components/Icon'
import Wave from '@/web/components/Animation/Wave'
import { formatDuration, resizeImage } from '@/web/utils/common'
import { State as PlayerState } from '@/web/utils/player'
import { css, cx } from '@emotion/css'
import { Fragment, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import React from 'react'
import { useSnapshot } from 'valtio'
import { openContextMenu } from '@/web/states/contextMenus'
import { motion } from 'framer-motion'
import { map } from 'lodash-es'
import Track from '@/web/components/TrackList/Track'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const Daily = ({ className }: { className?: string }) => {

  const { data: dailyRecommendSongs, isLoading: isLoadingDaily } = useQuery(
    [PlaylistApiNames.FetchDailyRecommendSongs],
    () => fetchDailyRecommendSongs(),
    reactQueryOptions
  )
  const { trackID, state } = useSnapshot(player)
  const tracks = dailyRecommendSongs?.data?.dailySongs || []

  let playingTrack = tracks?.find(track => track.id === trackID)
  const songIDs = tracks.map(track => {
    return track.id
  }) ?? []

  const onPlay = (trackID: number | null = null) => {
    player.playAList(songIDs, trackID)
  }

  const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
    if (isLoadingDaily) return
    if (e.type === 'contextmenu') {
      e.preventDefault()
      openContextMenu({
        event: e,
        type: 'track',
        dataSourceID: trackID,
        options: {
          useCursorPosition: true,
        },
      })
      return
    }

    if (e.detail === 2) onPlay?.(trackID)
  }

  return (
    <motion.div>
      {(isLoadingDaily ? [] : tracks)?.map((track, index) => {
        return <Track
          track={track}
          index={index}
          playingTrackID={playingTrack?.id || 0}
          state={state}
          handleClick={handleClick} />
      })}
    </motion.div>
  )
}

export default Daily
