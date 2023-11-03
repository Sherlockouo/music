import PageTransition from '@/web/components/PageTransition'
import { cx } from '@emotion/css'
import pkg from '../../../../package.json'
import Icon from '@/web/components/Icon'
import { Button } from './Controls'
import { useState } from 'react'
import axios from 'axios'
import { checkAPPUpdate } from '@/web/utils/ipcRender'
import toast from 'react-hot-toast'

const About = () => {
  const currentVersion = pkg.version
  const [checking, setChecking] = useState<boolean>(false)
  const [newVersion, setNewVersion] = useState<string>('')

  const checkUpdate = () => {
    // toast.error('开发中 ｜ developing')
    // return
    // checkAPPUpdate()
    setChecking(true)
    axios({
      method: 'get',
      url: 'https://github.com/Sherlockouo/music/releases',
    })
      .then(response => {
        const html = response.data
        // 解析html页面，找到最新的版本号
        const regex = /\/Sherlockouo\/music\/releases\/tag\/(.*?)"/
        const matches = html.match(regex)
        let latestVersion = matches[1]

        toast.success('latest version: ' + latestVersion)
        if (latestVersion > currentVersion) {
          setNewVersion(latestVersion)
        } else {
          setNewVersion(currentVersion)
        }
      })
      .catch(error => {
        // console.error('请求失败：', error);
      })
      .finally(() => {
        setChecking(false)
      })

    // if(newVersion != currentVersion) {
    //   toast.success("new version found "+newVersion)
    // }else {
    //   toast.success("you're running the latest version")
    // }
  }
  return (
    <PageTransition>
      <div className='about text-center'>
        <div className={cx('text-accent-color-500 text-lg font-bold', 'hover:underline')}>
          <a href='https://github.com/Sherlockouo/music' target='_blank'>
            欢迎参与开发设计
          </a>
        </div>
        <div className='basic-info padding-top-10'>
          <span> 基于 https://github.com/qier222/YesPlayMusic 二次开发 </span>
        </div>
        <div className='contact-me margin-top-10 text-center'>
          联系方式: wdf.coder@gmail.com | nwyfnck@gmail.com ｜ https://github.com/couriourc
        </div>

        <div className={cx('iterms-center mt-5 flex w-full justify-center gap-2')}>
          <div className='iterms-center flex text-center'>
            {' '}
            Current Running Version {currentVersion}{' '}
          </div>
          {window.env?.isElectron && (
            <div className='iterms-center flex '>
              {/* 刷新 */}
              <Button
                onClick={() => {
                  checkUpdate()
                }}
              >
                <Icon
                  name='refresh'
                  className={cx('h-5 w-5 font-extrabold ', checking && 'animate-spin')}
                ></Icon>
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

export default About
