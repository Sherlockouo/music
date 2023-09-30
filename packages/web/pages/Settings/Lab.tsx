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
        </>
    )
}

const Lab = () => {
    const { t, i18n } = useTranslation()
    return (
        <>
            <div className='text-xl font-medium pt-5'>{t`settings.lab`}</div>
            <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
            <div className='mb-2 dark:text-white'>
                <Unlock />
            </div>
            <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
        </>
    )
}

export default Lab