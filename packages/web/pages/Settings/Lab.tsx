import { BlockDescription, Input, Button, Option, OptionText, Switch } from './Controls'
import settings from '@/web/states/settings'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import {cx,css} from '@emotion/css'
import { useState } from 'react'

const Lab = () => {
    const { t, i18n } = useTranslation()
    return (
        <>
            <div className='text-xl font-medium pt-5'>{t`settings.lab`}</div>
            <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
            <div className='mb-2 dark:text-white flex justify-left items-center'>
                guess what? nothing here
            </div>
        </>
    )
}

export default Lab