import Store from 'electron-store'
import log from './log'

log.info('[electron] store.ts')

export interface TypedElectronStore {
  window: {
    width: number
    height: number
    x?: number
    y?: number
  }
  lyricsWindow: {
    width: number
    height: number
    x?: number
    y?: number
  }
  // settings: State['settings']
}

const store = new Store<TypedElectronStore>({
  defaults: {
    window: {
      width: 1440,
      height: 1024,
    },
    lyricsWindow: {
      width: 300,
      height: 600,
    },
    // settings: initialState.settings,
  },
})

export default store
