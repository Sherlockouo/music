import * as log4js from 'log4js'
log4js.configure({
  appenders: { xtify: { type: 'file', filename: 'Xtify.log' } },
  categories: { default: { appenders: ['xtify'], level: 'info' } },
})

const log = log4js.getLogger()
log.level = 'info'

export default log
