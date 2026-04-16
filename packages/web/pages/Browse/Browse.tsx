import Tabs from '@/web/components/Tabs'
import { useState, useCallback, memo } from 'react'
import PageTransition from '@/web/components/PageTransition'
import Recommend from './Recommend'
import Top from './Top'
import Hot from './Hot'
import { css, cx } from '@emotion/css'

const categories = [
  { id: 'recommend', name: 'Recommend', component: <Recommend /> },
  { id: 'top', name: 'Top', component: <Top key='top' cat='' /> },
  { id: 'ACG', name: 'ACG', component: <Top key='acg' cat='ACG' /> },
  { id: 'shake', name: '后摇', component: <Top key='shake' cat='后摇' /> },
  { id: 'acient', name: '古风', component: <Top key='acient' cat='古风' /> },
  { id: 'board', name: '榜单', component: <Top key='board' cat='榜单' /> },
  { id: 'hot', name: 'Hot', component: <Hot key='hot' cat='' /> },
  { id: 'pop', name: '流行', component: <Hot key='pop' cat='流行' /> },
  { id: 'rap', name: '说唱', component: <Hot key='rap' cat='说唱' /> },
  { id: 'cantonese', name: '粤语', component: <Hot key='cantonese' cat='粤语' /> },
  { id: 'mandarin', name: '华语', component: <Hot key='mandarin' cat='华语' /> },
  { id: 'western', name: '欧美', component: <Hot key='western' cat='欧美' /> },
]

const categoriesKeys = categories.map(c => c.id)
type Key = typeof categoriesKeys[number]

const Browse = memo(() => {
  const [active, setActive] = useState<Key>('recommend')

  const handleTabChange = useCallback((category: Key) => {
    setActive(category)
  }, [])

  return (
    <PageTransition>
      <div
        className={cx(
          'flex flex-col',
          css`
            height: calc(100vh - 132px);
          `
        )}
      >
        {/* Tabs 固定顶部 - 始终可见，有背景色防止内容穿透 */}
        <div className='bg-background z-20 mb-2.5 px-2.5 pt-2'>
          <Tabs
            tabs={categories.map(c => ({ id: c.id, name: c.name }))}
            value={active}
            onChange={handleTabChange}
            className='flex flex-wrap'
          />
        </div>

        {/* 内容区域 - 只渲染当前 tab */}
        <div className='flex-1 min-h-0'>
          {categories.map(({ id, component }) => {
            const isActive = id === active
            return (
              isActive && (
                <div key={id} className='h-full'>
                  {component}
                </div>
              )
            )
          })}
        </div>
      </div>
    </PageTransition>
  )
})

Browse.displayName = 'Browse'
export default Browse
