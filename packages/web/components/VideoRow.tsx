import toast from 'react-hot-toast'
import useUserVideos from '../api/hooks/useUserVideos'
import uiStates from '../states/uiStates'
import { isInteger } from 'lodash-es'

const VideoRow = ({ videos }: { videos: Video[] }) => {
  return (
    <div className='@container'>
      <div className='grid grid-cols-2 gap-6 @3xl:grid-cols-3 @7xl:grid-cols-4'>
        {videos.map(video => (
          <div
            key={video.vid}
            onClick={() => {
              uiStates.playingVideoID = video.vid
            }}
          >
            <img
              src={video.coverUrl}
              className='aspect-video w-full rounded-24 border object-cover'
            />
            <div className='line-clamp-2 mt-2 text-12 font-medium text-neutral-600'>
              {video.creator?.at(0)?.userName} - {video.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoRow
