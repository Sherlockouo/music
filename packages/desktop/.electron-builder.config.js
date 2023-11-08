/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

const pkg = require('./package.json')
const electronVersion = pkg.devDependencies.electron.replaceAll('^', '')

module.exports = {
  appId: 'app.r3playx',
  productName: pkg.productName,
  executableName: pkg.productName,
  copyright: 'Copyright © 2023 feng',
  asar: true,
  directories: {
    output: 'release',
    buildResources: 'build',
  },
  npmRebuild: false,
  buildDependenciesFromSource: false,
  electronVersion,
  forceCodeSigning: false,
  afterPack: './scripts/copySQLite3.js',
  publish: [
    {
      provider: 'github',
      owner: 'sherlockouo',
      repo: 'music',
      vPrefixedTagName: true,
      releaseType: 'draft',
    },
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
      // {
      //   target: 'portable',
      //   arch: ['x64'],
      // },
    ],
    publisherName: 'feng',
    icon: 'build/icons/icon.png',
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
    artifactName: '${productName}-${version}-${os}-${arch}-Setup.${ext}',
  },
  portable: {
    artifactName: '${productName}-${version}-${os}-${arch}-Portable.${ext}',
  },
  mac: {
    target: [
      // {
      //   target: 'zip',
      //   arch: ['x64', 'arm64', 'universal'],
      // },
      {
        target: 'dmg',
        arch: ['x64', 'arm64', 'universal'],
      },
    ],
    artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
    darkModeSupport: true,
    category: 'public.app-category.music',
    identity: null,
  },
  dmg: {
    icon: 'build/icons/icon.icns',
  },
  linux: {
    target: [
      // {
      //   target: 'deb',
      //   arch: [
      //     'x64',
      //     'arm64',
      //     // 'armv7l'
      //   ],
      // },
      {
        target: 'AppImage',
        arch: ['x64'],
      },
      // {
      //   target: 'snap',
      //   arch: ['x64'],
      // },
      // {
      //   target: 'pacman',
      //   arch: ['x64'],
      // },
      // {
      //   target: 'rpm',
      //   arch: ['x64', 'arm64'],
      // },
      // {
      //   target: 'tar.gz',
      //   arch: ['x64'],
      // },
    ],
    artifactName: '${productName}-${version}-${os}.${ext}',
    category: 'Music',
    icon: './build/icon.png',
  },
  files: [
    '!**/*.ts',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{pnpm-lock.yaml}',
    '!**/*.{map,debug.min.js}',
    '!**/unlock.js',
    '!**/node_modules/*',

    {
      from: './dist',
      to: './main',
    },
    {
      from: '../web/dist',
      to: './web',
    },
    {
      from: '../server/dist',
      to: './server',
    },
    {
      from: './migrations',
      to: 'main/migrations',
    },
    {
      from: './assets',
      to: 'main/assets',
    },
    './main',
  ],
}
