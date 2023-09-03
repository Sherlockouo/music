import useArtistSongs from '@/web/api/hooks/useArtistSongs'
import useTracks from '@/web/api/hooks/useTracks'
import { FetchArtistSongsParams } from '@/shared/api/Artist'
import { useMemo } from 'react'
import TrackList from '../Playlist/TrackList'
import player from '@/web/states/player'
import {useParams} from 'react-router-dom'
type ArtistProps = {
    order: string;
    limit: number;
    offset: number;
  };

const ArtistSongs = ({
    order,
    limit,
    offset
}:ArtistProps)=>{
    const params = useParams()
    const songsParams = {
        id: Number(params.id) || 0,
        order: order || 'time',
        limit: limit || 50,
        offset: offset || 0
    }
    const { data: data, isLoading: isLoadingArtistSongs } =
    useArtistSongs(songsParams)
    
    const songIDList = data?.songs ? data?.songs.map(song => song.id):[]
    

    const onPlay = async (trackID: number | null = null) => {
        await player.playAList(songIDList, trackID)
    }
    
    const { data: playlistTracks }  = useTracks({ids:songIDList})
    return <>
        <TrackList tracks={playlistTracks?.songs ?? []}
          onPlay={onPlay}
          className='z-10 mt-10'></TrackList>
    </>
}

export default ArtistSongs