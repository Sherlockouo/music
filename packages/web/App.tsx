import IpcRendererReact from '@/web/IpcRendererReact'
import Layout from '@/web/components/Layout'
import Devtool from '@/web/components/Devtool'
import ErrorBoundary from '@/web/components/ErrorBoundary'
import useIsMobile from '@/web/hooks/useIsMobile'
import LayoutMobile from '@/web/components/LayoutMobile'
import ScrollRestoration from '@/web/components/ScrollRestoration'
import Toaster from './components/Toaster'
import { cx } from '@emotion/css'
const App = () => {
  const isMobile = useIsMobile()

  return (
    <div className={cx(
      'rounded-24'
    )}>
      <ErrorBoundary>
        {isMobile ? <LayoutMobile /> : <Layout />}
        <Toaster />
        <ScrollRestoration />
        <IpcRendererReact />
        <Devtool />
      </ErrorBoundary>
    </div>
  )
}

export default App
