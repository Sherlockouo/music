import PlayLikedSongsCard from './PlayLikedSongsCard'
import PageTransition from '@/web/components/PageTransition'
import RecentlyListened from './RecentlyListened'
import Collections from './Collections'
import { useIsLoggedIn } from '@/web/api/hooks/useUser'
import { LayoutGroup, motion } from 'framer-motion'
import React from 'react'

function PleaseLogin() {
  return <></>
}

const My = () => {
  const isLoggedIn = useIsLoggedIn()
  return (
    <PageTransition>
      {/* {isLoggedIn ? ( */}
      <LayoutGroup>
        <div className='grid grid-cols-1 gap-10'>
          <PlayLikedSongsCard />
          <RecentlyListened />
          <Collections />
        </div>
      </LayoutGroup>
      {/* ) : (
        <PleaseLogin /> */}
      {/* )} */}
    </PageTransition>
  )
}

const MyMemo = React.memo(My)
MyMemo.displayName = "My"

export default MyMemo
