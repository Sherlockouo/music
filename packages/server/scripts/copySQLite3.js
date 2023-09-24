/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const pc = require('picocolors')
const fs = require('fs')

const projectDir = path.resolve(process.cwd(), '../../')
const binDir = `${projectDir}/tmp/bin`
console.log(pc.cyan(`projectDir=${projectDir}`))
console.log(pc.cyan(`binDir=${binDir}`))

exports.default = async function () {
  console.log('context , platform',process.arch, ' ', process.platform)
  const platform = process.platform
  const arch = process.arch

  // Mac
  if (platform === 'darwin') {
    if (arch === 'universal') return // Skip universal we already copy binary for x64 and arm64
    if (arch !== 'x64' && arch !== 'arm64') return // Skip other archs

    const from = `${binDir}/better_sqlite3_darwin_${arch}.node`
    const to = `${projectDir}/packages/server/dist/packages/server/bin/better_sqlite3_${platform}_${arch}.node`
    console.info(`copy ${from} to ${to}`)

    const toFolder = to.replace(`better_sqlite3_${platform}_${arch}.node`, '')
    if (!fs.existsSync(toFolder)) {
      fs.mkdirSync(toFolder, {
        recursive: true,
      })
    }

    try {
      fs.copyFileSync(from, to)
    } catch (e) {
      console.log(pc.red('Copy failed! Process stopped.'))
      throw e
    }
  }

  // Windows and Linux
  if (platform === 'win32' || platform === 'linux') {
    if (platform === 'win32' && arch !== 'x64') return // Skip windows arm

    const from = `${binDir}/better_sqlite3_${platform}_${arch}.node`
    const to = `${projectDir}/server/dist/packages/server/bin/better_sqlite3_${platform}_${arch}.node`
    console.info(`copy ${from} to ${to}`)
    const toFolder = to.replace('/better_sqlite3.node', '')
    if (!fs.existsSync(toFolder)) {
      fs.mkdirSync(toFolder, {
        recursive: true,
      })
    }

    try {
      fs.copyFileSync(from, to)
    } catch (e) {
      console.log(pc.red('Copy failed! Process stopped.'))
      throw e
    }
  }
}
()
