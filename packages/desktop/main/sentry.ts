import * as Sentry from '@sentry/electron'
import pkg from '../../../package.json'
import { appName } from './env'
import log from './log'

log.info(`[sentry] sentry initializing`)

Sentry.init({
  dsn: 'https://7d8a408fb378f9b378be20cff43de801@o4505816875532288.ingest.sentry.io/4505816882151424',
  release: `${appName}@${pkg.version}`,
  environment: process.env.NODE_ENV,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

log.info(`[sentry] sentry initialized`)
