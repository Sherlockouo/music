import { NsisUpdater, MacUpdater, AppImageUpdater , autoUpdater} from 'electron-updater'
import { AllPublishOptions } from "builder-util-runtime";
import log from './log'

// 写一个支持 win,mac,linux的更新器

export default class AppUpdater {
  checkUpdate() {
    const options:AllPublishOptions = {
      provider: 'generic',
      url: 'http://localhost:8100/',
    }
    
    const autoUpdater = new MacUpdater(options)
    autoUpdater.logger = log
    return autoUpdater.checkForUpdatesAndNotify()
  }
} 