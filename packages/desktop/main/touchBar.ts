import { BrowserWindow } from "electron";

const { TouchBar, nativeImage, ipcMain } = require('electron');
const { TouchBarButton, TouchBarSpacer } = TouchBar;
const path = require('path');

const iconDirRoot =
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), './assets/icons/tray')
    : path.join(__dirname, './assets/icons/tray')

function createNativeImage(filename: string) {
    // log.info("tray icon path "+path.join(iconDirRoot, filename))
    return nativeImage.createFromPath(path.join(iconDirRoot, filename))
  }

export function createTouchBar(window:BrowserWindow) {
  const renderer = window.webContents;

  // Icon follow touchbar design guideline.
  // See: https://developer.apple.com/design/human-interface-guidelines/macos/touch-bar/touch-bar-icons-and-images/
  // Icon Resource: https://devimages-cdn.apple.com/design/resources/

  const previousPage = new TouchBarButton({
    click: () => {
      renderer.send('routerGo', 'back');
    },
    icon: createNativeImage('page_prev.png'),
  });

  const nextPage = new TouchBarButton({
    click: () => {
      renderer.send('routerGo', 'forward');
    },
    icon: createNativeImage('page_next.png'),
  });

  const searchButton = new TouchBarButton({
    click: () => {
      renderer.send('search');
    },
    icon: createNativeImage('search.png'),
  });

  const playButton = new TouchBarButton({
    click: () => {
      renderer.send('play');
    },
    icon: createNativeImage('play.png'),
  });

  const previousTrackButton = new TouchBarButton({
    click: () => {
      renderer.send('previous');
    },
    icon: createNativeImage('backward.png'),
  });

  const nextTrackButton = new TouchBarButton({
    click: () => {
      renderer.send('next');
    },
    icon: createNativeImage('forward.png'),
  });

  const likeButton = new TouchBarButton({
    click: () => {
      renderer.send('like');
    },
    icon: createNativeImage('like.png'),
  });

  const nextUpButton = new TouchBarButton({
    click: () => {
      renderer.send('nextUp');
    },
    icon: createNativeImage('next_up.png'),
  });

  ipcMain.on('player', (e, { playing, likedCurrentTrack }) => {
    playButton.icon =
      playing === true ? createNativeImage('pause.png') : createNativeImage('play.png');
    likeButton.icon = likedCurrentTrack
      ? createNativeImage('like_fill.png')
      : createNativeImage('like.png');
  });

  const touchBar = new TouchBar({
    items: [
      previousPage,
      nextPage,
      searchButton,
      new TouchBarSpacer({ size: 'flexible' }),
      previousTrackButton,
      playButton,
      nextTrackButton,
      new TouchBarSpacer({ size: 'flexible' }),
      likeButton,
      nextUpButton,
    ],
  });
  return touchBar;
}
