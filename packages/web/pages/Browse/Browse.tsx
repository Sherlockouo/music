import Tabs from '@/web/components/Tabs'
import { fetchDailyRecommendPlaylists, fetchRecommendedPlaylists } from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import PageTransition from '@/web/components/PageTransition'
import { playerWidth, topbarHeight } from '@/web/utils/const'
import { cx, css } from '@emotion/css'
import CoverRow from '@/web/components/CoverRow'
import topbarBackground from '@/web/assets/images/topbar-background.png'
import Recommend from './Recommend'
import Top from './Top'
import Hot from './Hot'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const categories = [
  { id: 'recommend', name: 'Recommend', component: <Recommend /> },
  { id: 'top', name: 'Top', component: <Top cat='' /> },
  { id: 'ACG', name: 'ACG', component: <Top cat='ACG' /> },
  { id: 'shake', name: '后摇', component: <Top cat='后摇' /> },
  { id: 'acient', name: '古风', component: <Top cat='古风' /> },
  { id: 'board', name: '榜单', component: <Top cat='榜单' /> },
  { id: 'hot', name: 'Hot', component: <Hot cat='' /> },
  { id: 'pop', name: '流行', component: <Hot cat='流行' /> },
  { id: 'rap', name: '说唱', component: <Hot cat='说唱' /> },
  { id: 'cantonese', name: '粤语', component: <Hot cat='粤语' /> },
  { id: 'mandarin', name: '华语', component: <Hot cat='华语' /> },
  { id: 'western', name: '欧美', component: <Hot cat='欧美' /> },
]

const categoriesKeys = categories.map(c => c.id)
type Key = typeof categoriesKeys[number]

const Browse = () => {
  const [active, setActive] = useState<Key>('recommend')

  return (
    <PageTransition>
      <div className={cx('relative', 'mb-0')}>
        <Tabs
          tabs={categories}
          value={active}
          onChange={category => setActive(category)}
          className='top-0 z-10 mt-2.5 mb-2.5 flex flex-wrap px-2.5 pt-2'
        />

        <div className={cx('inset-0 mx-2.5 mt-0 ')}>
          {categories.find(c => c.id === active)?.component}
        </div>
      </div>
    </PageTransition>
  )
}

export default Browse
