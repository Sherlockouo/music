import { NsisUpdater, MacUpdater, AppImageUpdater, autoUpdater, UpdateInfo } from 'electron-updater'
import { AllPublishOptions } from 'builder-util-runtime'
import log from './log'
import { shell, dialog } from 'electron'
import { isDev } from './env'

export function checkForUpdates() {
  if (isDev) return
  log.info('checkForUpdates')
  autoUpdater.checkForUpdatesAndNotify()

  const showNewVersionMessage = (info: UpdateInfo) => {
    dialog
      .showMessageBox({
        title: '发现新版本 v' + info.version,
        message: '发现新版本 v' + info.version,
        detail: '是否前往 GitHub 下载新版本安装包？',
        buttons: ['下载', '取消'],
        type: 'question',
        noLink: true,
      })
      .then(result => {
        if (result.response === 0) {
          shell.openExternal('https://github.com/sherlockouo/music/releases')
        }
      })
  }

  autoUpdater.on('update-available', info => {
    showNewVersionMessage(info)
  })
}
