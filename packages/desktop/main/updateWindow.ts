import { NsisUpdater,MacUpdater,AppImageUpdater } from "electron-updater"
// Or MacUpdater, AppImageUpdater

export default class NsisAppUpdater {
    constructor() {
        const options= {
            requestHeaders: {
                // Any request headers to include here
            },
            provider: 'github',
            url: 'https://github.com/Sherlockouo/music/releases'
        }

        const autoUpdater = new NsisUpdater(options) 
        console.log('create updater');
        
        autoUpdater.checkForUpdatesAndNotify()
    }
}
