import { BlockDescription, Input, Button, Option, OptionText, Switch } from './Controls'
import settings from '@/web/states/settings'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import {cx,css} from '@emotion/css'
import { useState } from 'react'

const Unlock = () => {
    const { t, i18n } = useTranslation()
    const { unlock,engines } = useSnapshot(settings)
    let engine = ''
    engines.forEach((e:string)=>{
        engine += e + ',' 
    })
    const [presetEngine, setEngine] = useState<string>(engine || '')
        
    
    
    return (
        <>
            <Option>
                <OptionText>{t`settings.unlock`}</OptionText>
                <Switch
                    enabled={unlock}
                    onChange={value => (settings.unlock = value)}
                />
            </Option>
            <Option>
                <OptionText>{t`settings.engine`}</OptionText>
                <input
                onChange={e => {
                  setEngine(e.target.value)
                  console.log('engine:',e.target.value)
                }}
                className={cx(
                  'my-3.5  bg-transparent placeholder:text-white/30',
                  css`
                    width: 60%;
                  `
                )}
                placeholder='qq,kuwo'
                value={presetEngine}
              />
                <Button
                    onClick={()=>{
                        settings.engines = presetEngine.split(',')
                    }}
                > 确定 </Button>
            </Option>
        </>
    )
}

const Lab = () => {
    const { t, i18n } = useTranslation()
    return (
        <>
            <div className='text-xl font-medium text-gray-800 dark:text-white/70 pt-5'>{t`settings.lab`}</div>
            <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
            <div className='mb-2 dark:text-white'>
                <Unlock />
            </div>
            <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
        </>
    )
}

export default Lab