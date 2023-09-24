/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const pkg = require(`${process.cwd()}/package.json`)
const stream = require('stream')
const { resolve } = require('path')
const { execSync } = require('child_process')
const axios = require('axios')
const pc = require('picocolors')
const { promisify } = require('util')


const betterSqlite3Version = pkg.dependencies['better-sqlite3'].replaceAll('^', '')
const arch = process.arch

const projectDir = resolve(process.cwd(), '../../')
const tmpDir = resolve(projectDir, `./tmp/better-sqlite3-docker`)

const finished = promisify(stream.finished)

async function download(){

    const fileName = `better-sqlite3-v${betterSqlite3Version}-node-v115-${process.platform}-${arch}`
    const zipFileName = `${fileName}.tar.gz`
    const url = `https://ghproxy.com/https://github.com/JoshuaWise/better-sqlite3/releases/download/v${betterSqlite3Version}/${zipFileName}`
    console.log('url ',url)
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, {
            recursive: true,
        })
    }

    try {
        await axios({
          method: 'get',
          url,
          responseType: 'stream',
        }).then((response:any) => {
          const writer = fs.createWriteStream(resolve(tmpDir, `./${zipFileName}`))
          response.data.pipe(writer)
          return finished(writer)
        })
      } catch (e) {
        console.log(pc.red('Download failed! Skip download.', e))
        return false
      }
    
      try {
        execSync(`tar -xvzf ${tmpDir}/${zipFileName} -C ${tmpDir}`)
      } catch (e) {
        console.log(pc.red('Extract failed! Skip extract.', e))
        return false
      }
}

async function main(){
  await download()
}

main()