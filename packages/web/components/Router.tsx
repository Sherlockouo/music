import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import React, { lazy, Suspense, startTransition, useEffect } from 'react'
import VideoPlayer from './VideoPlayer'
import Loading from './Animation/Loading'
import { useGASend } from '@/web/api/hooks/useGA'

const My = lazy(() => import('@/web/pages/My'))
const Discover = lazy(() => import('@/web/pages/Discover'))
const Browse = lazy(() => import('@/web/pages/Browse/Browse'))
const Album = lazy(() => import('@/web/pages/Album'))
const Playlist = lazy(() => import('@/web/pages/Playlist'))
const Artist = lazy(() => import('@/web/pages/Artist'))
const Lyrics = lazy(() => import('@/web/pages/Lyrics/Lyrics'))
const LyricsDesktop = lazy(() => import('@/web/pages/Lyrics/LyricsDesktop'))
const Search = lazy(() => import('@/web/pages/Search'))
const Settings = lazy(() => import('@/web/pages/Settings'))

const Router = () => {
  const location = useLocation()

  useGASend()
  return (
    // this keeps the UI updates responsive even on slow device and networ
    <AnimatePresence>
      <Suspense
        fallback={
          <div className='iterms-center flex h-full w-full justify-center'>
            <Loading />
          </div>
        }
      >
        <VideoPlayer />
        <Routes location={location} key={location.pathname}>
          <Route path='/' element={<My />} />
          <Route path='/discover' element={<Discover />} />
          <Route path='/browse' element={<Browse />} />
          <Route path='/album/:id' element={<Album />} />
          <Route path='/playlist/:id' element={<Playlist />} />
          <Route path='/artist/:id' element={<Artist />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/lyrics' element={<Lyrics />} />
          <Route path='/desktoplyrics' element={<LyricsDesktop />} />
          <Route path='/search/:keywords' element={<Search />}>
            <Route path=':type' element={<Search />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

const RouterMemo = React.memo(Router)
RouterMemo.displayName = "Router"
export default Router
