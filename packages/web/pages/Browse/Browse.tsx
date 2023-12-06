import Tabs from '@/web/components/Tabs'
import { useState } from 'react'
import PageTransition from '@/web/components/PageTransition'
import { cx, css } from '@emotion/css'
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
  { id: 'top', name: 'Top', component: <Top key={"top"} cat='' /> },
  { id: 'ACG', name: 'ACG', component: <Top key={"acg"} cat='ACG' /> },
  { id: 'shake', name: '后摇', component: <Top key={"shake"} cat='后摇' /> },
  { id: 'acient', name: '古风', component: <Top key={"acient"} cat='古风' /> },
  { id: 'board', name: '榜单', component: <Top key={"board"} cat='榜单' /> },
  { id: 'hot', name: 'Hot', component: <Hot key={"hot"} cat='' /> },
  { id: 'pop', name: '流行', component: <Hot key={"pop"} cat='流行' /> },
  { id: 'rap', name: '说唱', component: <Hot key={"rap"} cat='说唱' /> },
  { id: 'cantonese', name: '粤语', component: <Hot key={"cantonese"} cat='粤语' /> },
  { id: 'mandarin', name: '华语', component: <Hot key={"mandarin"} cat='华语' /> },
  { id: 'western', name: '欧美', component: <Hot key={"western"} cat='欧美' /> },
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
