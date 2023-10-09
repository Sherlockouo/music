import { changeTheme } from "@/web/utils/theme"
import Icon from "../Icon"
import { useState } from "react"
import { useSnapshot } from "valtio"
import settings from "@/web/states/settings"

const Theme = () => {
    const {theme} = useSnapshot(settings)
    return (
    <>
    <div className="app-region-no-drag flex h-12 w-12 items-center justify-center rounded-full  text-neutral-500 dark:text-neutral-500 dark:bg-neutral-700 bg-white/60 hover:bg-white transition duration-400 dark:hover:bg-neutral-100" onClick={()=>{
        if(theme == "dark") {
            changeTheme('light')
            settings.theme = 'light'
        }
        else {
        changeTheme('dark')
        settings.theme = 'dark'
        }
    }}>

        <Icon name='sun' className="h-9 w-9 text-white"/>
    </div>
    </>
)}

export default Theme