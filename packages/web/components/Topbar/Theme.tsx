import { changeTheme } from "@/web/utils/theme"
import Icon from "../Icon"
import { useState } from "react"
import { useSnapshot } from "valtio"
import settings from "@/web/states/settings"

const Theme = () => {
    const {theme} = useSnapshot(settings)
    return (
    <>
    <div className="app-region-no-drag flex h-12 w-12 items-center justify-center rounded-full bg-day-600 text-neutral-500 transition duration-400 dark:bg-white/10 dark:hover:bg-white/20 dark:hover:text-neutral-300" onClick={()=>{
        if(theme == "dark") {
            changeTheme('light')
            settings.theme = 'light'
        }
        else {
        changeTheme('dark')
        settings.theme = 'dark'
        }
    }}>

        <Icon name='sun' className="h-full w-full text-white"/>
    </div>
    </>
)}

export default Theme