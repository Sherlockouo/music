import './utils/initLog'
import './utils/theme'
import { StrictMode } from 'react'
import * as ReactDOMClient from 'react-dom/client'
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
  HashRouter,
} from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import 'virtual:svg-icons-register'
import './styles/global.css'
import './styles/accentColor.css'
import App from './App'
import pkg from '../../package.json'
import ReactGA from 'react-ga4'
import { ipcRenderer } from './ipcRenderer'
import { QueryClientProvider } from '@tanstack/react-query'
import reactQueryClient from '@/web/utils/reactQueryClient'
import React from 'react'
import './i18n/i18n'
import { appName } from './utils/const'

// google analytic
ReactGA.initialize('G-QFPDJGN751')

// 前端报错监控
Sentry.init({
  dsn: 'https://7d8a408fb378f9b378be20cff43de801@o4505816875532288.ingest.sentry.io/4505816882151424',
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
  ],
  release: `${appName}@${pkg.version}`,
  environment: import.meta.env.MODE,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

ipcRenderer()

const container = document.getElementById('root') as HTMLElement
const root = ReactDOMClient.createRoot(container)

root.render(
  <StrictMode>
    <HashRouter>
      <QueryClientProvider client={reactQueryClient}>
        <App />
      </QueryClientProvider>
    </HashRouter>
  </StrictMode>
)
